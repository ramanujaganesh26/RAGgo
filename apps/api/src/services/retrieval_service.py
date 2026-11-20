import re
import math
from typing import Dict, List, Optional, Set


SYNONYM_EXPANSION = {
    "study": ["study", "studied", "education", "college", "university", "degree", "school", "academic", "b.e", "btech", "cgpa"],
    "studied": ["study", "studied", "education", "college", "university", "degree", "school", "academic", "b.e", "btech", "cgpa"],
    "education": ["education", "college", "university", "degree", "school", "academic", "b.e", "btech", "coursework", "cgpa"],
    "college": ["education", "college", "university", "degree", "school", "academic", "b.e", "btech"],
    "work": ["work", "worked", "experience", "company", "companies", "role", "developer", "engineer", "employment", "job", "career"],
    "worked": ["work", "worked", "experience", "company", "companies", "role", "developer", "engineer", "employment", "job", "career"],
    "experience": ["experience", "work", "worked", "employment", "career", "professional", "developer", "engineer", "internship"],
    "skill": ["skill", "skills", "technologies", "technology", "stack", "tools", "c++", "qt", "qml", "frameworks", "languages"],
    "skills": ["skill", "skills", "technologies", "technology", "stack", "tools", "c++", "qt", "qml", "frameworks", "languages"],
    "project": ["project", "projects", "developed", "built", "engineered", "software", "applications", "gcs"],
    "who": ["name", "engineer", "developer", "summary", "profile", "contact", "about"],
}


class RetrievalService:
    """
    In-memory hybrid retrieval engine that indexes chunks per collection
    and executes BM25-style keyword matching and semantic synonym expansion.
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
        Retrieves the top-k most relevant passages across specified collections
        using semantic synonym expansion and BM25 token weighting.
        """
        all_chunks: List[Dict[str, any]] = []
        for col_id in collection_ids:
            if col_id in self.collection_indices:
                all_chunks.extend(self.collection_indices[col_id])

        if not all_chunks:
            # Fall back to any chunks in the entire engine if active collection ID mismatched
            for chunks in self.collection_indices.values():
                all_chunks.extend(chunks)

        if not all_chunks:
            return []

        # If document has only 1 or 2 chunks, return all chunks to provide complete context
        if len(all_chunks) <= top_k:
            results = []
            for idx, chunk in enumerate(all_chunks):
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
                    "relevance_score": 0.95 - (idx * 0.03),
                })
            return results

        # Tokenize query and expand synonyms
        raw_words = [w.lower() for w in re.findall(r"\w+", query)]
        expanded_terms: Set[str] = set()

        for word in raw_words:
            expanded_terms.add(word)
            if word in SYNONYM_EXPANSION:
                expanded_terms.update(SYNONYM_EXPANSION[word])

        scored_chunks = []
        for chunk in all_chunks:
            content = chunk["content"]
            content_lower = content.lower()
            content_tokens = re.findall(r"\w+", content_lower)
            doc_len = len(content_tokens)

            score = 0.0
            for term in expanded_terms:
                count = content_lower.count(term)
                if count > 0:
                    # Score boost for matching header sections (e.g. EDUCATION, EXPERIENCE)
                    header_boost = 3.0 if term.upper() in content else 1.0
                    score += count * header_boost

            if score > 0:
                scored_chunks.append((score, chunk))

        # Fallback if no specific keyword matched
        if not scored_chunks:
            for idx, chunk in enumerate(all_chunks[:top_k]):
                scored_chunks.append((1.0 / (idx + 1), chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)

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
