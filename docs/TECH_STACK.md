# Technology Stack Specification

## 1. Stack Overview

The platform uses a layered, polyglot architecture optimized for low-latency retrieval, high-density document parsing, and enterprise security.

---

## 2. Layer-by-Layer Technology Breakdown

### 2.1 Enterprise Web Client (Custom Frontend)
- **Framework**: Next.js 14+ (App Router) / React 18+
- **Language**: TypeScript (Strict typing enabled)
- **Styling**: Tailwind CSS with enterprise design tokens
- **Component Primitives**: Radix UI / shadcn-ui (accessible, unstyled headless primitives)
- **Icons**: Lucide React
- **State Management**: Zustand / TanStack Query (React Query)
- **Streaming Client**: Native `fetch` with `ReadableStream` / Server-Sent Events (SSE)
- **Document Viewing**: PDF.js / react-pdf for inline source page and citation bounding-box highlighting

### 2.2 Application Gateway & Orchestration (Custom Backend)
- **Framework**: Python 3.11 with FastAPI (Asynchronous ASGI)
- **Data Validation & Typing**: Pydantic v2
- **HTTP Client**: `httpx` (Async HTTP with connection pooling)
- **Security & Auth**: OAuth2 / JWT with role-based access control (RBAC)
- **Event Streaming**: Server-Sent Events (SSE) via `starlette.responses.StreamingResponse`
- **Telemetry**: OpenTelemetry / Structured JSON logging

### 2.3 Foundational RAG Engine (RAGFlow Subsystem)
- **Core Server**: RAGFlow Service (`ragflow_server` Go / Python runtime)
- **Document Parser**: DeepDoc (Vision-based layout analysis, OCR, table extraction)
- **Deep Learning Framework**: PyTorch / ONNX Runtime
- **Vector & Full-Text Engine**: InfiniFlow Infinity (AI-native dense + sparse vector DB)
- **Relational Metadata**: MySQL 8.0 / PostgreSQL
- **Object Storage**: MinIO (S3-compatible distributed object storage)
- **Task Broker & Cache**: Redis / Kvrocks

### 2.4 LLM & Embedding Integrations
- **Cloud LLMs**: Google Gemini (gemini-1.5-pro / gemini-2.0-flash), OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet)
- **Local LLMs**: Ollama / vLLM utilizing local hardware (NVIDIA RTX 5050 Laptop GPU, 8 GB VRAM with CUDA 13.1 acceleration)
- **Embeddings**: BAAI/bge-large-en-v1.5, BAAI/bge-m3, Text-Embedding-3-Large

---

## 3. Host Environment Compatibility Verification

| Component | Target Requirement | Detected Local Machine Spec | Status |
| :--- | :--- | :--- | :--- |
| **Operating System** | Windows 11 / Linux | Windows 11 Build 26200 | Verified |
| **CPU** | 8+ Cores recommended | Intel Core Ultra 7 255H (16 Cores, 22 Threads) | Verified (Exceeds requirement) |
| **RAM** | 16 GB+ recommended | 24 GB Physical Memory (8.4 GB currently available) | Verified |
| **Disk Space** | 50 GB+ for models & storage | 555 GB Free on C: Drive | Verified |
| **Node.js** | v18+ / v20+ | v26.13.1 (npm v11.20.0) | Verified |
| **Python** | 3.10 or 3.11 | Python 3.11.9 | Verified |
| **GPU / Acceleration** | CUDA capable (Optional) | NVIDIA GeForce RTX 5050 (8 GB VRAM, Driver 592.19, CUDA 13.1) | Verified |
| **Container Engine** | Docker Desktop & Compose | Docker Client 29.9.3 (Daemon needs start) | Installed, Action Required |
