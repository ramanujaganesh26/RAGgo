import io
import re
from typing import Dict, List, Tuple
from pypdf import PdfReader


class DocumentParser:
    """
    Extracts text, metadata, and semantic chunks from uploaded documents.
    Supports PDF, TXT, Markdown, CSV, and code files with section-aware chunking.
    """

    @staticmethod
    def extract_text_and_pages(content: bytes, filename: str, content_type: str) -> List[Tuple[int, str]]:
        """
        Returns a list of (page_number, text) tuples.
        """
        results: List[Tuple[int, str]] = []
        lower_name = filename.lower()

        if lower_name.endswith(".pdf") or "pdf" in content_type:
            try:
                reader = PdfReader(io.BytesIO(content))
                for page_idx, page in enumerate(reader.pages):
                    page_text = page.extract_text() or ""
                    clean_text = page_text.strip()
                    if clean_text:
                        results.append((page_idx + 1, clean_text))
            except Exception:
                decoded = content.decode("utf-8", errors="ignore").strip()
                if decoded:
                    results.append((1, decoded))
        else:
            try:
                text = content.decode("utf-8", errors="replace").strip()
                if text:
                    results.append((1, text))
            except Exception:
                text = content.decode("latin-1", errors="ignore").strip()
                if text:
                    results.append((1, text))

        return results

    @staticmethod
    def chunk_document(
        pages: List[Tuple[int, str]],
        document_id: str,
        document_name: str,
        max_chunk_words: int = 400,
    ) -> List[Dict[str, any]]:
        """
        Chunks page text into semantic sections or paragraphs while preserving
        structural line breaks and tracking exact page numbers.
        """
        chunks: List[Dict[str, any]] = []
        chunk_idx = 1

        section_pattern = r"\n\s*(?=(?:SUMMARY|SKILLS|TECHNICAL SKILLS|PROFESSIONAL EXPERIENCE|EXPERIENCE|WORK EXPERIENCE|INTERNSHIPS|CERTIFICATIONS|EDUCATION|PROJECTS|PUBLICATIONS|REFERENCES)\b)"

        for page_num, page_text in pages:
            # Check for section boundaries
            raw_sections = [
                s.strip()
                for s in re.split(section_pattern, page_text, flags=re.IGNORECASE)
                if s.strip()
            ]

            if not raw_sections:
                raw_sections = [page_text.strip()]

            for section in raw_sections:
                words = section.split()
                if len(words) <= max_chunk_words:
                    chunks.append({
                        "chunk_id": f"{document_id}_{chunk_idx}",
                        "document_id": document_id,
                        "document_name": document_name,
                        "page_number": page_num,
                        "content": section,
                        "word_count": len(words),
                    })
                    chunk_idx += 1
                else:
                    # Slide by paragraph or double newline
                    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", section) if p.strip()]
                    current_chunk_lines = []
                    current_word_count = 0

                    for p in paragraphs:
                        p_words = len(p.split())
                        if current_word_count + p_words > max_chunk_words and current_chunk_lines:
                            chunk_content = "\n\n".join(current_chunk_lines)
                            chunks.append({
                                "chunk_id": f"{document_id}_{chunk_idx}",
                                "document_id": document_id,
                                "document_name": document_name,
                                "page_number": page_num,
                                "content": chunk_content,
                                "word_count": current_word_count,
                            })
                            chunk_idx += 1
                            current_chunk_lines = []
                            current_word_count = 0

                        current_chunk_lines.append(p)
                        current_word_count += p_words

                    if current_chunk_lines:
                        chunk_content = "\n\n".join(current_chunk_lines)
                        chunks.append({
                            "chunk_id": f"{document_id}_{chunk_idx}",
                            "document_id": document_id,
                            "document_name": document_name,
                            "page_number": page_num,
                            "content": chunk_content,
                            "word_count": current_word_count,
                        })
                        chunk_idx += 1

        return chunks


document_parser = DocumentParser()
