# Repository Audit & Upstream Analysis: RAGFlow (InfiniFlow)

## 1. Upstream Identity & Metadata

- **Repository**: [https://github.com/infiniflow/ragflow](https://github.com/infiniflow/ragflow)
- **Primary Maintainer**: InfiniFlow Inc.
- **License**: Apache License, Version 2.0
- **Ecosystem Focus**: Agent-native RAG engine built on deep document understanding and multi-vector infrastructure.

---

## 2. Architectural Analysis of RAGFlow

```
+---------------------------------------------------------------------------------+
|                                 RAGFlow System                                  |
|                                                                                 |
|  +--------------------+        +---------------------+        +--------------+  |
|  |     Web Client     |  <-->  |   API / Web Server  |  <-->  |   Backend    |  |
|  | (React / UmiJS /   |        | (Go / Python /      |        | Task Workers |  |
|  |  Ant Design)       |        |  REST / SSE)        |        | (Celery/Go)  |  |
|  +--------------------+        +----------+----------+        +-------+------+  |
|                                           |                           |         |
|         +---------------------------------+---------------------------+         |
|         |                     Persistence & Engines                   |         |
|         v                                 v                           v         |
|  +--------------+                  +--------------+            +-------------+  |
|  | MySQL / PG   |                  | MinIO (S3)   |            | Redis/      |  |
|  | (Metadata)   |                  | (Files/Imgs) |            | Kvrocks     |  |
|  +--------------+                  +--------------+            +-------------+  |
|         ^                                                             |         |
|         +-------------------------+-----------------------------------+         |
|                                   v                                             |
|                     +---------------------------+                               |
|                     | Vector & Document Storage |                               |
|                     | (Infinity / Elasticsearch)|                               |
|                     +---------------------------+                               |
|                                   ^                                             |
|                     +-------------+-------------+                               |
|                     |   DeepDoc Vision Engine   |                               |
|                     | (OCR, Layout, Table Model)|                               |
|                     +---------------------------+                               |
+---------------------------------------------------------------------------------+
```

### 2.1 Backend Core
- **Server Architecture**: Transitioning from pure Python microservices toward a unified Go-based binary (`ragflow_server`) with Python DeepDoc inference runners.
- **API Surface**: Extensive RESTful `/api/v1` routes with 90+ endpoints managing datasets, documents, chunks, chat assistants, and sessions.
- **OpenAI Compatibility**: Exposes `/api/v1/openai/{chat_id}/chat/completions` for direct integration with third-party tools.
- **Asynchronous Execution**: Ingestion, OCR parsing, and chunking run through background task workers decoupled from the HTTP API.

### 2.2 Document Processing & DeepDoc
- **Vision-Based Extraction**: Uses custom layout analysis models (YOLO / OCR / ResNet) to detect headers, footers, columns, tables, and figures.
- **Chunking Engines**: Provides specialized template chunkers:
  - `General / Naive`
  - `Manual` (Preserves step-by-step hierarchies)
  - `Law` (Respects legal clauses and sub-clauses)
  - `Table / Excel` (Serializes tabular structures without distortion)
  - `Paper / Academic` (Respects dual-column research paper formats)

### 2.3 Storage and Search Infrastructure
1. **Relational Metadata (MySQL / PostgreSQL)**:
   - Stores user accounts, knowledge base schemas, document statuses, task IDs, and configuration.
2. **Object Store (MinIO)**:
   - Houses original binaries (PDFs, DOCX, images), extracted page cuts, and OCR visualization artifacts.
3. **Document & Vector Storage**:
   - **Infinity**: InfiniFlow's AI-native vector database optimized for multi-vector, hybrid dense/sparse search, and high-concurrency retrieval.
   - **Elasticsearch / OpenSearch**: Supported alternative for enterprise deployments requiring legacy search clusters.
4. **Caching & Message Broker**:
   - Redis or Kvrocks / NATS for real-time task queue coordination and transient state.

### 2.4 Frontend Layer
- Implemented in React, UmiJS, Ant Design, and Tailwind CSS.
- Strongly coupled to RAGFlow's internal branding, terminology, and visual hierarchy.

---

## 3. Evaluation of Customization Strategies

| Evaluation Criterion | Strategy A: Direct Fork & In-Tree Modification | Strategy B: Complete Reimplementation from Scratch | Strategy C: Hybrid Architecture (Recommended) |
| :--- | :--- | :--- | :--- |
| **Upstream Upgradability** | Low (Heavy merge conflicts when RAGFlow updates UmiJS/backend) | Zero (No upstream sync) | **High** (RAGFlow updates in clean Docker container without breaking custom app) |
| **Brand Identity** | Medium (Risk of lingering internal strings/components) | High | **High** (100% custom enterprise UI/UX with proprietary design system) |
| **Development Velocity** | Slow (Debugging complex internal UmiJS/Python dependencies) | Extremely Slow (Reinventing DeepDoc & layout models takes years) | **Fast** (Reuses battle-tested RAG engine while moving fast on custom product layer) |
| **Custom Business Logic** | High risk of breaking core engine assumptions | Full control | **Full control** in custom Application Gateway layer |
| **License Compliance** | Straightforward | N/A | **Clean and Transparent** (Clear separation of custom code and Apache 2.0 engine) |

### Strategic Recommendation: Hybrid Architecture (Strategy C)
We preserve the upstream RAGFlow engine as an isolated, containerized core service while building:
1. A **Custom Enterprise Application Gateway** (FastAPI / Node.js) handling custom multi-tenant logic, audit logs, and orchestration.
2. A **Proprietary Enterprise UI** (Next.js / Tailwind CSS / Radix UI) providing real-time document processing observability, citation visualization, and refined multi-document chat.
