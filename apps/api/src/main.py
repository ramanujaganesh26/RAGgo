from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .routers import chat, collections, documents, health

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Enterprise Multi-Document RAG Orchestration Gateway",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(collections.router, prefix=settings.api_prefix)
app.include_router(documents.router, prefix=settings.api_prefix)
app.include_router(chat.router, prefix=settings.api_prefix)


@app.on_event("startup")
async def preload_existing_documents():
    """Automatically parses and indexes any existing documents in data/uploads."""
    import os
    from .services.document_parser import document_parser
    from .services.retrieval_service import retrieval_service
    from .routers.documents import DOCUMENTS_STORE, UPLOAD_DIR
    from .models.schemas import DocumentResponse, DocumentMetadata, IngestionStage
    from datetime import datetime, timezone

    if not os.path.exists(UPLOAD_DIR):
        return

    for fname in os.listdir(UPLOAD_DIR):
        fpath = os.path.join(UPLOAD_DIR, fname)
        if os.path.isfile(fpath) and fname.endswith(".pdf"):
            try:
                with open(fpath, "rb") as fp:
                    content = fp.read()
                clean_name = fname.split("_", 1)[1] if "_" in fname else fname
                doc_id = fname.split("_", 1)[0] if "_" in fname else "doc-init"
                pages = document_parser.extract_text_and_pages(content, clean_name, "application/pdf")
                chunks = document_parser.chunk_document(pages, doc_id, clean_name)
                retrieval_service.index_chunks("col-01", chunks)
                retrieval_service.index_chunks("col-default", chunks)

                now = datetime.now(timezone.utc)
                DOCUMENTS_STORE[doc_id] = DocumentResponse(
                    id=doc_id,
                    collection_id="col-01",
                    filename=clean_name,
                    file_type="application/pdf",
                    file_size_bytes=len(content),
                    stage=IngestionStage.COMPLETED,
                    progress_percentage=100,
                    metadata=DocumentMetadata(
                        filename=clean_name,
                        file_type="application/pdf",
                        file_size_bytes=len(content),
                        page_count=len(pages),
                        chunk_count=len(chunks),
                    ),
                    created_at=now,
                    updated_at=now,
                )
            except Exception:
                pass


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": f"{settings.api_prefix}/health",
    }
