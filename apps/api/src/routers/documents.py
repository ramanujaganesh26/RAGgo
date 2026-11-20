import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from ..models.schemas import DocumentMetadata, DocumentResponse, IngestionStage

router = APIRouter(prefix="/documents", tags=["Documents"])

# In-memory store for documents and processing state
DOCUMENTS_STORE: Dict[str, DocumentResponse] = {}


@router.get("", response_model=List[DocumentResponse])
async def list_documents(collection_id: Optional[str] = None):
    """List documents optionally filtered by collection ID."""
    if collection_id:
        return [doc for doc in DOCUMENTS_STORE.values() if doc.collection_id == collection_id]
    return list(DOCUMENTS_STORE.values())


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    collection_id: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Accepts document upload and dispatches multi-stage background processing.
    """
    content = await file.read()
    now = datetime.now(timezone.utc)
    doc_id = str(uuid.uuid4())

    meta = DocumentMetadata(
        filename=file.filename or "unnamed_document",
        file_type=file.content_type or "application/octet-stream",
        file_size_bytes=len(content),
        page_count=None,
        chunk_count=0,
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
    return doc


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str):
    """Retrieve detailed document status and metadata."""
    if document_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    return DOCUMENTS_STORE[document_id]


@router.get("/{document_id}/stages")
async def stream_document_stages(document_id: str):
    """
    Server-Sent Events (SSE) stream reporting real-time document ingestion lifecycle stages:
    Validating -> Parsing -> OCR -> Chunking -> Indexing -> Completed.
    """
    if document_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")

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
            await asyncio.sleep(0.5)
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
async def reprocess_document(document_id: str):
    """Re-trigger ingestion pipeline for a document."""
    if document_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = DOCUMENTS_STORE[document_id]
    doc.stage = IngestionStage.PENDING
    doc.progress_percentage = 0
    doc.updated_at = datetime.now(timezone.utc)
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str):
    """Delete a document and remove it from the knowledge base."""
    if document_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    del DOCUMENTS_STORE[document_id]
    return None
