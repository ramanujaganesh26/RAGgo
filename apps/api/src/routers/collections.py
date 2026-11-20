import uuid
from datetime import datetime, timezone
from typing import Dict, List
from fastapi import APIRouter, HTTPException, status
from ..models.schemas import CollectionCreate, CollectionResponse, ParsingTemplate

router = APIRouter(prefix="/collections", tags=["Collections"])

# In-memory storage for collections (orchestrated with RAGFlow datasets)
COLLECTIONS_STORE: Dict[str, CollectionResponse] = {}


@router.get("", response_model=List[CollectionResponse])
async def list_collections():
    """List all knowledge collections."""
    return list(COLLECTIONS_STORE.values())


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(payload: CollectionCreate):
    """Create a new enterprise document collection."""
    now = datetime.now(timezone.utc)
    collection_id = str(uuid.uuid4())
    collection = CollectionResponse(
        id=collection_id,
        name=payload.name,
        description=payload.description,
        parsing_template=payload.parsing_template,
        embedding_model=payload.embedding_model,
        document_count=0,
        chunk_count=0,
        created_at=now,
        updated_at=now,
    )
    COLLECTIONS_STORE[collection_id] = collection
    return collection


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(collection_id: str):
    """Retrieve details of a specific collection."""
    if collection_id not in COLLECTIONS_STORE:
        raise HTTPException(status_code=404, detail="Collection not found")
    return COLLECTIONS_STORE[collection_id]


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(collection_id: str):
    """Delete a collection and its associated index references."""
    if collection_id not in COLLECTIONS_STORE:
        raise HTTPException(status_code=404, detail="Collection not found")
    del COLLECTIONS_STORE[collection_id]
    return None
