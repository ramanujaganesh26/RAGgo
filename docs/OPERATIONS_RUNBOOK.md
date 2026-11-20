# Operations Runbook: Enterprise Multi-Document RAG Platform

## 1. Overview & System Topology

AegisDoc Intelligence operates as an enterprise decoupled system:
- **Port 3000**: Next.js Enterprise Web Client
- **Port 8000**: FastAPI Orchestration Gateway
- **Port 9380**: Foundational RAGFlow Engine API
- **Port 23817**: Infinity AI Vector Database
- **Port 9000/9001**: MinIO Object Storage & Console
- **Port 3306**: MySQL Metadata Database
- **Port 6379**: Redis Queue & Cache

---

## 2. Production Deployment Procedure

### 2.1 Environment Setup
1. Copy `.env.example` to `.env`:
   ```powershell
   cp .env.example .env
   ```
2. Populate the required production secrets (`APP_SECRET_KEY`, `MYSQL_PASSWORD`, `MINIO_SECRET_KEY`, `REDIS_PASSWORD`).

### 2.2 Starting the Platform
Launch the complete multi-tier stack with Docker Compose:
```powershell
docker compose -f docker-compose.prod.yml up -d
```

### 2.3 Health Verification
Confirm all services report healthy status:
```powershell
# 1. Check Gateway Health
curl http://localhost:8000/api/v1/health

# 2. Check RAGFlow Core Engine
curl http://localhost:9380/api/v1/system/healthz

# 3. Check Docker Container States
docker compose -f docker-compose.prod.yml ps
```

---

## 3. Backup & Disaster Recovery

### 3.1 Metadata Backup (MySQL)
```powershell
docker exec aegis_mysql mysqldump -u rag_flow -p rag_flow > backup_ragflow_metadata.sql
```

### 3.2 Vector Index Backup (Infinity DB)
Snapshot the persistent volume `infinity_data` directly from Docker volumes.

### 3.3 Raw Documents & Extracted Images (MinIO)
Use the MinIO client (`mc`) to mirror the document bucket:
```powershell
mc mirror minio/ragflow-documents D:/backups/minio/ragflow-documents
```

---

## 4. Ingestion Lifecycle Troubleshooting

| Stage | Common Error Cause | Recommended Action |
| :--- | :--- | :--- |
| `validating` | Unsupported MIME format or corrupted file header | Confirm file is valid PDF, DOCX, XLSX, TXT, or CSV |
| `parsing` | Scanned PDF missing OCR layers or corrupted fonts | Ensure DeepDoc OCR runner container has memory allocation |
| `chunking` | Incompatible chunk template for schema | Re-try with `general` or `table` template via collection settings |
| `indexing` | Infinity DB connection timeout | Verify Infinity container health at port 23817 |

---

## 5. Security & Audit Guidelines

- **Zero Secret Ingestion**: All `.env` files and certificates are protected by gitignore.
- **Audit Trails**: Security logs are written to stdout in structured JSON format (`aegis.audit`), tracking all document uploads, queries, and deletions.
- **Grounding Guard**: Prompts enforce zero hallucinated citations with fallback responses when source passages are insufficient.
