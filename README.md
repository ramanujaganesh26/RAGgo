# AegisDoc Intelligence (RAGgo)

Enterprise Multi-Document Retrieval-Augmented Generation (RAG) Platform.

Built with deep document understanding, layout-aware parsing, real-time ingestion observability, and verifiable citations. Powered by [RAGFlow](https://github.com/infiniflow/ragflow) as the foundational RAG and DeepDoc engine.

---

## Architecture Overview

AegisDoc Intelligence uses a hybrid, decoupled architecture:

- **Enterprise Web Client**: Next.js 14, TypeScript, Tailwind CSS, Radix UI.
- **Application Gateway**: Asynchronous FastAPI service orchestrating authentication, tenant access, and query routing.
- **Foundational Engine**: RAGFlow Core, Infinity Vector Database, MinIO, MySQL, and Redis.
- **Deep Document Processing**: DeepDoc layout analysis, OCR, table recognition, and template chunking.

---

## Project Documentation

Detailed architecture specifications, environment audits, and roadmap plans are available in the [docs/](file:///c:/Users/raman/Desktop/RAGgo/docs) directory:

- [Project Overview](file:///c:/Users/raman/Desktop/RAGgo/docs/PROJECT_OVERVIEW.md)
- [System Architecture](file:///c:/Users/raman/Desktop/RAGgo/docs/ARCHITECTURE.md)
- [Technology Stack](file:///c:/Users/raman/Desktop/RAGgo/docs/TECH_STACK.md)
- [Repository Audit & Upstream Analysis](file:///c:/Users/raman/Desktop/RAGgo/docs/REPOSITORY_AUDIT.md)
- [Development Roadmap](file:///c:/Users/raman/Desktop/RAGgo/docs/DEVELOPMENT_ROADMAP.md)
- [Engineering & Coding Standards](file:///c:/Users/raman/Desktop/RAGgo/docs/CODING_STANDARDS.md)

---

## Upstream Project Attribution & License

This platform integrates with and references components from [RAGFlow](https://github.com/infiniflow/ragflow), developed by InfiniFlow Inc. and licensed under the **Apache License, Version 2.0**. All original copyright notices, license terms, and notices are maintained in accordance with the Apache 2.0 license.

Our custom application layer, proprietary design system, and orchestration services are maintained in this repository.
