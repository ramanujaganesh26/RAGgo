# System Architecture Specification

## 1. High-Level Architecture Overview

The platform is designed around a three-tier decoupled architecture:
1. **Enterprise Client Tier**: Custom Next.js web application with a purpose-built design system, real-time ingestion observability, and multi-document chat.
2. **Application Gateway & Orchestration Tier**: FastAPI service that manages authentication, tenant isolation, business logic, prompt orchestration, audit logging, and proxying to the RAG engine.
3. **Foundational Ingestion & Vector Retrieval Tier**: The RAGFlow engine running in Docker, managing DeepDoc parsing, layout analysis, vector indexing (Infinity), object storage (MinIO), and metadata (MySQL).

---

## 2. Component Diagram

```
+-----------------------------------------------------------------------------------------+
|                                    USER BROWSER                                         |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |              Enterprise Web Client (Next.js 14 / TypeScript / Tailwind)           |  |
|  |                                                                                   |  |
|  |  +-------------------------+  +-------------------------+  +-------------------+  |  |
|  |  | Ingestion Observer      |  | Multi-Doc Chat Window   |  | Source Preview    |  |  |
|  |  | (Stage-by-Stage Logs)   |  | (SSE Token Stream)      |  | (PDF / Passages)  |  |  |
|  |  +-------------------------+  +-------------------------+  +-------------------+  |  |
|  +-----------------------------------------+-----------------------------------------+  |
+--------------------------------------------|--------------------------------------------+
                                             | REST / Server-Sent Events (SSE)
                                             v
+-----------------------------------------------------------------------------------------+
|                                  APPLICATION GATEWAY                                    |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |                          FastAPI Orchestration Service                            |  |
|  |                                                                                   |  |
|  |  +--------------------+  +----------------------+  +---------------------------+  |  |
|  |  | Auth & Tenant RBAC |  | Ingestion Controller |  | Prompt & Grounding Guard  |  |  |
|  |  +--------------------+  +----------------------+  +---------------------------+  |  |
|  |  +--------------------+  +----------------------+  +---------------------------+  |  |
|  |  | Audit & Event Bus  |  | SSE Stream Delivery  |  | Health & Telemetry        |  |  |
|  |  +--------------------+  +----------------------+  +---------------------------+  |  |
|  +-----------------------------------------+-----------------------------------------+  |
+--------------------------------------------|--------------------------------------------+
                                             | Internal REST / API v1
                                             v
+-----------------------------------------------------------------------------------------+
|                          FOUNDATIONAL ENGINE (RAGFlow Stack)                            |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |                    RAGFlow Core Service (Docker Container)                        |  |
|  |                                                                                   |  |
|  |  +----------------------------------+   +--------------------------------------+  |  |
|  |  | DeepDoc Vision & Parsing Engine  |   | Hybrid Retrieval & Reranker          |  |  |
|  |  | (YOLO Layout, OCR, Chunkers)     |   | (Vector + BM25 Full-Text)            |  |  |
|  |  +----------------------------------+   +--------------------------------------+  |  |
|  +-----------------------------------------------------------------------------------+  |
|                                            |                                            |
|         +----------------------------------+----------------------------------+         |
|         |                                  |                                  |         |
|         v                                  v                                  v         |
|  +--------------+                   +--------------+                   +-------------+  |
|  | Infinity DB  |                   | MinIO Storage|                   | MySQL / PG  |  |
|  | (AI Vector + |                   | (Raw Docs &  |                   | (Metadata,  |  |
|  |  Sparse Text)|                   |  Page Images)|                   |  Tasks)     |  |
|  +--------------+                   +--------------+                   +-------------+  |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                  LLM INFERENCE LAYER                                    |
|                                                                                         |
|  +---------------------------------------+   +---------------------------------------+  |
|  | Cloud Providers                       |   | Local Acceleration (Ollama / vLLM)    |  |
|  | (Google Gemini, OpenAI, Anthropic)    |   | (NVIDIA RTX 5050 8GB VRAM / CUDA 13.1)|  |
|  +---------------------------------------+   +---------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Data & Processing Flows

### 3.1 Document Ingestion Flow (Stage-by-Stage Observability)
1. **Client Upload**: User uploads documents through the drag-and-drop workspace.
2. **Pre-flight Validation**: Application Gateway checks MIME type, file integrity, and maximum size limits.
3. **RAGFlow Ingestion Trigger**: File is submitted to RAGFlow's `/api/v1/datasets/{dataset_id}/documents`.
4. **DeepDoc Parsing**:
   - Layout analysis detects reading order and document structure.
   - OCR runs on scanned regions.
   - Tables are extracted as structured markdown/HTML.
5. **Template-Based Chunking**: The selected parser (General, Law, Manual, Table) segments text without splitting atomic concepts.
6. **Vectorization**: Dense embeddings are generated and stored in Infinity DB.
7. **Real-Time Stage Reporting**: Ingestion status changes are pushed to the client via SSE/polling, updating the UI stage pill in real time.

### 3.2 Query & Retrieval Flow
1. **Question Submission**: User asks a query with an active collection filter.
2. **Hybrid Search**: RAGFlow executes dense vector search + BM25 keyword search concurrently on Infinity.
3. **Cross-Encoder Reranking**: Retrieved candidates are scored and ranked for semantic relevance.
4. **Context Construction & Prompt Guard**: Passages are assembled with strict attribution tags (`[Doc: XYZ, Page: N]`).
5. **LLM Generation**: Prompt is dispatched to the configured LLM (Gemini / OpenAI / Local).
6. **Streaming & Citation Verification**: Answer tokens stream progressively to the UI alongside interactive citation badges that highlight source text upon clicking.
