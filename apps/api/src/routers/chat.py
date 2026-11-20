import asyncio
import json
import time
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from ..core.security import log_audit_event, verify_api_key
from ..models.schemas import ChatAnswerResponse, ChatQueryRequest, Citation
from ..services.llm_service import llm_service
from ..services.retrieval_service import retrieval_service

router = APIRouter(prefix="/chat", tags=["Chat & Retrieval"])


@router.post("/completions", response_model=ChatAnswerResponse)
async def chat_query(
    request: ChatQueryRequest,
    api_key: str = Depends(verify_api_key),
):
    """
    Execute grounded multi-document question answering with verifiable citations.
    Searches the actual indexed document chunks from the uploaded documents.
    """
    start_time = time.perf_counter()

    # Search actual indexed document chunks
    passages = retrieval_service.search(
        query=request.query,
        collection_ids=request.collection_ids,
        top_k=request.top_k,
    )

    log_audit_event(
        action="CHAT_QUERY",
        resource_type="COLLECTION",
        resource_id=",".join(request.collection_ids),
        details={
            "query": request.query,
            "passages_found": len(passages),
            "stream": request.stream,
        },
    )

    if request.stream:

        async def stream_tokens():
            if not passages:
                msg = "No indexed content was found matching your inquiry. Please upload documents to this collection first."
                for word in msg.split():
                    await asyncio.sleep(0.04)
                    yield f"data: {json.dumps({'token': word + ' '})}\n\n"
                yield f"data: {json.dumps({'done': True, 'citations': [], 'grounded': False})}\n\n"
                return

            async for token in llm_service.generate_grounded_stream(request.query, passages):
                await asyncio.sleep(0.008)
                yield f"data: {json.dumps({'token': token})}\n\n"

            # Format citation metadata for client inspection
            formatted_citations = [
                {
                    "citation_id": p["citation_id"],
                    "document_id": p["document_id"],
                    "document_name": p["document_name"],
                    "page_number": p.get("page_number", 1),
                    "snippet": p["snippet"],
                    "relevance_score": p["relevance_score"],
                }
                for p in passages
            ]

            yield f"data: {json.dumps({'done': True, 'citations': formatted_citations, 'grounded': True})}\n\n"

        return StreamingResponse(stream_tokens(), media_type="text/event-stream")

    latency = (time.perf_counter() - start_time) * 1000

    citations = [
        Citation(
            citation_id=p["citation_id"],
            document_id=p["document_id"],
            document_name=p["document_name"],
            page_number=p.get("page_number", 1),
            snippet=p["snippet"],
            relevance_score=p["relevance_score"],
        )
        for p in passages
    ]

    return ChatAnswerResponse(
        answer=f"Found {len(passages)} relevant section(s) in uploaded document(s).",
        citations=citations,
        grounded=len(passages) > 0,
        retrieval_latency_ms=round(latency, 2),
    )
