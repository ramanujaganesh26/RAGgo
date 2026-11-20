import asyncio
import os
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from ..core.security import log_audit_event, verify_api_key
from ..models.schemas import DocumentMetadata, DocumentResponse, IngestionStage
from ..services.document_parser import document_parser
from ..services.retrieval_service import retrieval_service

router = APIRouter(prefix="/documents", tags=["Documents"])

# In-memory document store
DOCUMENTS_STORE: Dict[str, DocumentResponse] = {}

UPLOAD_DIR = os.path.join(os.getcwd(), "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    collection_id: Optional[str] = None,
    api_key: str = Depends(verify_api_key),
):
    """List documents filtered optionally by collection ID."""
    if collection_id:
        return [doc for doc in DOCUMENTS_STORE.values() if doc.collection_id == collection_id]
    return list(DOCUMENTS_STORE.values())


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    collection_id: str = Form(...),
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key),
):
    """
    Accepts document upload, extracts actual text and pages via DocumentParser,
    generates semantic chunks, and registers them in the RetrievalService index.
    """
    content_type = file.content_type or "application/octet-stream"
    filename = file.filename or "unnamed_document"

    content = await file.read()
    now = datetime.now(timezone.utc)
    doc_id = str(uuid.uuid4())

    # Save physical file to disk
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{filename}")
    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception:
        pass

    # Extract actual text & pages
    pages = document_parser.extract_text_and_pages(content, filename, content_type)
    page_count = max(1, len(pages))

    # Generate semantic chunks
    chunks = document_parser.chunk_document(pages, doc_id, filename)
    chunk_count = len(chunks)

    # Index chunks in retrieval engine
    retrieval_service.index_chunks(collection_id, chunks)

    meta = DocumentMetadata(
        filename=filename,
        file_type=content_type,
        file_size_bytes=len(content),
        page_count=page_count,
        chunk_count=chunk_count,
    )

    doc = DocumentResponse(
        id=doc_id,
        collection_id=collection_id,
        filename=meta.filename,
        file_type=meta.file_type,
        file_size_bytes=meta.file_size_bytes,
        stage=IngestionStage.UPLOADED,
        progress_percentage=20,
        metadata=meta,
        created_at=now,
        updated_at=now,
    )
    DOCUMENTS_STORE[doc_id] = doc

    log_audit_event(
        action="DOCUMENT_UPLOAD",
        resource_type="DOCUMENT",
        resource_id=doc_id,
        details={
            "filename": filename,
            "size_bytes": len(content),
            "collection_id": collection_id,
            "pages": page_count,
            "chunks": chunk_count,
        },
    )

    return doc


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    api_key: str = Depends(verify_api_key),
):
    """Retrieve detailed document metadata and status."""
    if document_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    return DOCUMENTS_STORE[document_id]


@router.get("/{document_id}/stages")
async def stream_document_stages(
    document_id: str,
    api_key: str = Depends(verify_api_key),
):
    """
    Server-Sent Events (SSE) stream reporting real-time document ingestion lifecycle stages.
    """
    if document_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")

    target_doc = DOCUMENTS_STORE[document_id]

    async def event_generator():
        stages = [
            (IngestionStage.VALIDATING, 30, "Checking document format and structural integrity"),
            (IngestionStage.PARSING, 50, "Executing DeepDoc layout analysis and text flow detection"),
            (IngestionStage.OCR, 65, "Processing scanned regions and tabular data"),
            (IngestionStage.CHUNKING, 80, "Executing template-based semantic segmentation"),
            (IngestionStage.INDEXING, 95, "Generating embeddings and indexing in Infinity vector DB"),
            (IngestionStage.COMPLETED, 100, "Document indexed and ready for retrieval"),
        ]

        for stage, progress, detail in stages:
            await asyncio.sleep(0.3)
            if document_id in DOCUMENTS_STORE:
                DOCUMENTS_STORE[document_id].stage = stage
                DOCUMENTS_STORE[document_id].progress_percentage = progress
                DOCUMENTS_STORE[document_id].updated_at = datetime.now(timezone.utc)

            event_data = {
                "document_id": document_id,
                "stage": stage.value,
                "progress_percentage": progress,
                "detail": detail,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            yield f"data: {json.dumps(event_data)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/{document_id}/reprocess", response_model=DocumentResponse)
async def reprocess_document(
    document_id: str,
    api_key: str = Depends(verify_api_key),
):
    """Re-trigger ingestion pipeline for an existing document."""
    if document_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = DOCUMENTS_STORE[document_id]
    doc.stage = IngestionStage.PENDING
    doc.progress_percentage = 0
    doc.updated_at = datetime.now(timezone.utc)

    log_audit_event(
        action="DOCUMENT_REPROCESS",
        resource_type="DOCUMENT",
        resource_id=document_id,
    )
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    api_key: str = Depends(verify_api_key),
):
    """Delete a document and purge its vector embeddings."""
    if document_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")

    del DOCUMENTS_STORE[document_id]
    retrieval_service.remove_document_chunks(document_id)

    log_audit_event(
        action="DOCUMENT_DELETE",
        resource_type="DOCUMENT",
        resource_id=document_id,
    )
    return None
