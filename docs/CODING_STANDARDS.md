# Engineering & Coding Standards

## 1. Core Principles

1. **Human Understandability First**: Code must be readable, explicit, and self-documenting. Avoid clever one-liners that obscure intent.
2. **No Monolithic Files**: Break modules into focused, single-responsibility units (maximum 250–300 lines per file where practical).
3. **Zero Emojis**: Never use emojis in source code, commit messages, comments, user interfaces, logs, or system documentation.
4. **Strict Typing**: All TypeScript code must pass `tsc --noEmit` with strict null checks. All Python code must use type annotations validated with MyPy / Pydantic.
5. **No Fake or Mock Data in Production Paths**: Never fabricate progress percentages, fake statistics, or mock citations.

---

## 2. Python Standards (Application Gateway & Tools)

- **Version**: Python 3.11+
- **Style Guide**: PEP 8 enforced via `ruff` and `black`.
- **Typing**: Use standard Python type hints (`int`, `str`, `list[str]`, `dict[str, Any]`, `Optional[T]`).
- **Data Models**: Use Pydantic v2 `BaseModel` with explicit field validation and documentation.
- **Async Conventions**: All I/O-bound operations (database queries, network requests to RAGFlow/LLMs) must use `async`/`await` with `httpx`.
- **Exception Handling**:
  - Catch specific exceptions, never bare `except:`.
  - Return standardized JSON error envelopes:
    ```json
    {
      "error": {
        "code": "DOCUMENT_PARSE_FAILED",
        "message": "Human-readable explanation of error",
        "details": {}
      }
    }
    ```

---

## 3. TypeScript & Frontend Standards

- **Version**: TypeScript 5.0+, Next.js 14+ App Router.
- **Style Guide**: Enforced via ESLint and Prettier.
- **State Management**:
  - Server state: TanStack Query (React Query) for caching and background synchronization.
  - Client state: Zustand with isolated slices.
- **Component Design**:
  - Single-responsibility presentation components.
  - Business logic separated into custom hooks (`useDocumentIngestion`, `useStreamingChat`).
  - Strict prop validation with TypeScript interfaces.

---

## 4. Git & Commit Guidelines

- **Format**: Conventional Commits: `<type>(<scope>): <subject>`
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`
  - Example: `feat(ingestion): implement SSE pipeline for document processing stages`
- **Rules**:
  - Atomic commits representing a single logical change.
  - Never commit `.env` or credential files.
  - No destructive Git commands without explicit confirmation.
