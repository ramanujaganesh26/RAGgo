import io
import re
from typing import Dict, List, Tuple
from pypdf import PdfReader


class DocumentParser:
    """
    Extracts text, metadata, and semantic chunks from uploaded documents.
    Supports PDF, TXT, Markdown, CSV, and code files.
    """

    @staticmethod
    def extract_text_and_pages(content: bytes, filename: str, content_type: str) -> List[Tuple[int, str]]:
        """
        Returns a list of (page_number, text) tuples.
        For plain text / markdown / CSV, page_number is 1.
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
            except Exception as e:
                # Fallback to binary decode
                decoded = content.decode("utf-8", errors="ignore").strip()
                if decoded:
                    results.append((1, decoded))
        else:
            # Plain text, CSV, markdown, JSON, etc.
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
        chunk_size: int = 350,
        chunk_overlap: int = 50,
    ) -> List[Dict[str, any]]:
        """
        Chunks page text into semantic paragraphs while tracking exact page numbers.
        """
        chunks: List[Dict[str, any]] = []
        chunk_idx = 1

        for page_num, page_text in pages:
            # Split into paragraphs or sentences
            paragraphs = [p.strip() for p in re.split(r"\n\s*\n", page_text) if p.strip()]

            if not paragraphs:
                # Split by newline or sentence
                paragraphs = [s.strip() for s in page_text.split("\n") if len(s.strip()) > 30]

            for para in paragraphs:
                words = para.split()
                if len(words) <= chunk_size:
                    chunks.append({
                        "chunk_id": f"{document_id}_{chunk_idx}",
                        "document_id": document_id,
                        "document_name": document_name,
                        "page_number": page_num,
                        "content": para,
                        "word_count": len(words),
                    })
                    chunk_idx += 1
                else:
                    # Slide window
                    for i in range(0, len(words), chunk_size - chunk_overlap):
                        window = words[i : i + chunk_size]
                        if not window:
                            break
                        chunk_str = " ".join(window)
                        chunks.append({
                            "chunk_id": f"{document_id}_{chunk_idx}",
                            "document_id": document_id,
                            "document_name": document_name,
                            "page_number": page_num,
                            "content": chunk_str,
                            "word_count": len(window),
                        })
                        chunk_idx += 1

        return chunks


document_parser = DocumentParser()
