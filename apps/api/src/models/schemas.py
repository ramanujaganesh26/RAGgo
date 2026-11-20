from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class IngestionStage(str, Enum):
    PENDING = "pending"
    UPLOADING = "uploading"
    UPLOADED = "uploaded"
    VALIDATING = "validating"
    PARSING = "parsing"
    OCR = "ocr"
    CHUNKING = "chunking"
    INDEXING = "indexing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ParsingTemplate(str, Enum):
    GENERAL = "general"
    LAW = "law"
    MANUAL = "manual"
    TABLE = "table"
    PAPER = "paper"


class CollectionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    parsing_template: ParsingTemplate = ParsingTemplate.GENERAL
    embedding_model: str = "BAAI/bge-large-en-v1.5"


class CollectionCreate(CollectionBase):
    pass


class CollectionResponse(CollectionBase):
    id: str
    document_count: int = 0
    chunk_count: int = 0
    created_at: datetime
    updated_at: datetime


class DocumentMetadata(BaseModel):
    filename: str
    file_type: str
    file_size_bytes: int
    page_count: Optional[int] = None
    chunk_count: int = 0
    parsing_duration_seconds: Optional[float] = None
    error_message: Optional[str] = None


class DocumentResponse(BaseModel):
    id: str
    collection_id: str
    filename: str
    file_type: str
    file_size_bytes: int
    stage: IngestionStage
    progress_percentage: int
    metadata: DocumentMetadata
    created_at: datetime
    updated_at: datetime


class IngestionStageEvent(BaseModel):
    document_id: str
    stage: IngestionStage
    progress_percentage: int
    details: str
    timestamp: datetime


class Citation(BaseModel):
    citation_id: int
    document_id: str
    document_name: str
    page_number: Optional[int] = None
    snippet: str
    relevance_score: float


class ChatQueryRequest(BaseModel):
    query: str = Field(..., min_length=1)
    collection_ids: List[str] = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)
    stream: bool = True


class ChatAnswerResponse(BaseModel):
    answer: str
    citations: List[Citation]
    grounded: bool
    retrieval_latency_ms: float
