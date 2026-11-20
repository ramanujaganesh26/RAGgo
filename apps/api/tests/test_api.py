import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "services" in data


def test_collections_crud():
    # 1. Create collection
    create_payload = {
        "name": "Financial Reports Q3",
        "description": "Quarterly earnings and audits",
        "parsing_template": "table",
        "embedding_model": "BAAI/bge-large-en-v1.5",
    }
    create_res = client.post("/api/v1/collections", json=create_payload)
    assert create_res.status_code == 201
    collection = create_res.json()
    collection_id = collection["id"]
    assert collection["name"] == create_payload["name"]

    # 2. List collections
    list_res = client.get("/api/v1/collections")
    assert list_res.status_code == 200
    collections = list_res.json()
    assert any(c["id"] == collection_id for c in collections)

    # 3. Get single collection
    get_res = client.get(f"/api/v1/collections/{collection_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == collection_id

    # 4. Delete collection
    del_res = client.delete(f"/api/v1/collections/{collection_id}")
    assert del_res.status_code == 204

    # 5. Verify deletion
    verify_res = client.get(f"/api/v1/collections/{collection_id}")
    assert verify_res.status_code == 404


def test_document_upload_and_lifecycle():
    # Create collection first
    col_res = client.post(
        "/api/v1/collections",
        json={"name": "Test Col", "parsing_template": "general"},
    )
    col_id = col_res.json()["id"]

    # Upload mock document
    file_content = b"%PDF-1.4 Mock document test binary content"
    files = {"file": ("test_doc.pdf", file_content, "application/pdf")}
    data = {"collection_id": col_id}

    upload_res = client.post("/api/v1/documents/upload", data=data, files=files)
    assert upload_res.status_code == 202
    doc = upload_res.json()
    doc_id = doc["id"]
    assert doc["filename"] == "test_doc.pdf"
    assert doc["collection_id"] == col_id

    # Get document
    get_doc_res = client.get(f"/api/v1/documents/{doc_id}")
    assert get_doc_res.status_code == 200
    assert get_doc_res.json()["id"] == doc_id

    # Reprocess document
    reprocess_res = client.post(f"/api/v1/documents/{doc_id}/reprocess")
    assert reprocess_res.status_code == 200
    assert reprocess_res.json()["stage"] == "pending"

    # Delete document
    del_doc_res = client.delete(f"/api/v1/documents/{doc_id}")
    assert del_doc_res.status_code == 204


def test_chat_non_streaming():
    # Create collection and upload document first
    col_res = client.post(
        "/api/v1/collections",
        json={"name": "Architecture Knowledge", "parsing_template": "general"},
    )
    col_id = col_res.json()["id"]

    file_content = b"The platform architecture is designed around a three-tier decoupled system with DeepDoc parsing."
    files = {"file": ("architecture.txt", file_content, "text/plain")}
    data = {"collection_id": col_id}
    client.post("/api/v1/documents/upload", data=data, files=files)

    payload = {
        "query": "What is the system architecture?",
        "collection_ids": [col_id],
        "top_k": 3,
        "stream": False,
    }
    chat_res = client.post("/api/v1/chat/completions", json=payload)
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "answer" in data
    assert "citations" in data
    assert data["grounded"] is True
    assert len(data["citations"]) > 0
