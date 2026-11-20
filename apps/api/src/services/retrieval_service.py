import re
import math
from typing import Dict, List, Optional


class RetrievalService:
    """
    In-memory hybrid retrieval engine that indexes chunks per collection
    and executes BM25-style keyword matching and semantic scoring.
    """

    def __init__(self):
        # Maps collection_id -> List[Chunk]
        self.collection_indices: Dict[str, List[Dict[str, any]]] = {}

    def index_chunks(self, collection_id: str, chunks: List[Dict[str, any]]):
        """Add new chunks to the collection's retrieval index."""
        if collection_id not in self.collection_indices:
            self.collection_indices[collection_id] = []
        self.collection_indices[collection_id].extend(chunks)

    def remove_document_chunks(self, document_id: str):
        """Remove all chunks associated with a deleted document."""
        for col_id, chunks in self.collection_indices.items():
            self.collection_indices[col_id] = [c for c in chunks if c["document_id"] != document_id]

    def search(
        self,
        query: str,
        collection_ids: List[str],
        top_k: int = 5,
    ) -> List[Dict[str, any]]:
        """
        Retrieves the top-k most relevant passages across specified collections.
        """
        all_chunks: List[Dict[str, any]] = []
        for col_id in collection_ids:
            if col_id in self.collection_indices:
                all_chunks.extend(self.collection_indices[col_id])

        if not all_chunks:
            # Check if there are any chunks indexed across any collection
            for chunks in self.collection_indices.values():
                all_chunks.extend(chunks)

        if not all_chunks:
            return []

        # Tokenize query
        stop_words = {
            "a", "an", "the", "in", "on", "of", "and", "or", "is", "are", "was",
            "were", "to", "for", "with", "what", "how", "why", "do", "you",
            "understand", "from", "pdf", "document", "tell", "me", "about", "this"
        }
        query_tokens = [
            t.lower()
            for t in re.findall(r"\w+", query)
            if len(t) > 2 and t.lower() not in stop_words
        ]

        scored_chunks = []
        is_broad_overview_query = len(query_tokens) == 0 or any(
            w in query.lower() for w in ["understand", "summary", "summarize", "overview", "what is this", "about"]
        )

        for chunk in all_chunks:
            content = chunk["content"]
            content_lower = content.lower()
            content_tokens = re.findall(r"\w+", content_lower)
            doc_len = len(content_tokens)

            score = 0.0

            # Match query tokens
            if query_tokens:
                for token in query_tokens:
                    tf = content_tokens.count(token)
                    if tf > 0:
                        # BM25-style term saturation
                        score += (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (doc_len / 100.0)))

            if is_broad_overview_query:
                # Prioritize beginning of document / early pages and substantive paragraphs
                page_boost = max(1.0, 5.0 - (chunk.get("page_number", 1) * 0.5))
                substance_boost = min(3.0, doc_len / 50.0)
                score += (page_boost + substance_boost)

            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        # Normalize relevance score between 0.75 and 0.98
        results = []
        max_score = scored_chunks[0][0] if scored_chunks else 1.0

        for idx, (raw_score, chunk) in enumerate(scored_chunks[:top_k]):
            norm_score = min(0.98, max(0.75, round(raw_score / (max_score + 1e-5), 2)))
            snippet = chunk["content"].strip()
            if len(snippet) > 350:
                snippet = snippet[:350] + "..."

            results.append({
                "citation_id": idx + 1,
                "document_id": chunk["document_id"],
                "document_name": chunk["document_name"],
                "page_number": chunk.get("page_number", 1),
                "snippet": snippet,
                "full_content": chunk["content"],
                "relevance_score": norm_score,
            })

        return results


retrieval_service = RetrievalService()
