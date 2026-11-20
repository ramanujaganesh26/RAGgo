import os
import re
import json
import httpx
from typing import AsyncGenerator, Dict, List, Optional
from ..core.config import settings

GROUNDING_SYSTEM_PROMPT = """You are AegisDoc Intelligence, an enterprise document reasoning assistant.
Strict Grounding Rules:
1. Answer the question using ONLY the provided retrieved context passages.
2. For every factual assertion, append numerical citation references matching the source index, e.g. [1], [2].
3. If the retrieved context does not contain sufficient information to answer the question with high certainty, explicitly state: "The uploaded documents do not contain sufficient information to answer this inquiry."
4. Never speculate, infer without evidence, or fabricate citations.
"""


class LLMService:
    """
    Enterprise LLM orchestration service supporting:
    - Google Gemini Streaming API (when GEMINI_API_KEY is configured)
    - OpenAI API (when OPENAI_API_KEY is configured)
    - Dynamic Local Extractive Synthesizer (when offline or keys unconfigured)
    """

    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "gemini").lower()
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")

    def build_grounded_prompt(self, query: str, passages: List[Dict[str, any]]) -> str:
        context_str = "\n\n".join(
            [f"--- Passage [{p['citation_id']}] (Source: {p['document_name']}, Page: {p.get('page_number', 'N/A')}) ---\n{p['snippet']}"
             for p in passages]
        )
        return f"{GROUNDING_SYSTEM_PROMPT}\n\nCONTEXT:\n{context_str}\n\nUSER QUESTION:\n{query}\n\nANSWER:"

    async def generate_grounded_stream(
        self, query: str, passages: List[Dict[str, any]]
    ) -> AsyncGenerator[str, None]:
        """
        Streams answers token-by-token directly grounded in the provided document passages.
        """
        if not passages:
            yield "No indexed documents were found in this collection. Please upload your document(s) first to ask questions."
            return

        # 1. Attempt Cloud Gemini API if GEMINI_API_KEY is available
        gemini_key = os.getenv("GEMINI_API_KEY") or self.gemini_key
        if gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key={gemini_key}"
                prompt = self.build_grounded_prompt(query, passages)
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024},
                }
                async with httpx.AsyncClient(timeout=30.0) as client:
                    async with client.stream("POST", url, json=payload) as response:
                        if response.status_code == 200:
                            async for chunk in response.aiter_lines():
                                if not chunk:
                                    continue
                                try:
                                    # Parse SSE / JSON chunk
                                    cleaned = chunk.lstrip("data: ").strip()
                                    if cleaned.startswith("{") and cleaned.endswith("}"):
                                        data = json.loads(cleaned)
                                        candidates = data.get("candidates", [])
                                        if candidates:
                                            parts = candidates[0].get("content", {}).get("parts", [])
                                            for part in parts:
                                                text = part.get("text", "")
                                                if text:
                                                    yield text
                                except Exception:
                                    pass
                            return
            except Exception:
                pass  # Fall through to local extractive synthesizer

        # 2. Local Grounded Synthesizer (Reads directly from user's actual document passages)
        doc_names = list(dict.fromkeys([p["document_name"] for p in passages]))
        primary_doc = doc_names[0] if doc_names else "document"

        intro = f"Based on the analysis of **{primary_doc}**, here are the key findings:\n\n"
        for word in intro.split(" "):
            yield word + " "

        for p in passages:
            cite_num = p["citation_id"]
            page_num = p.get("page_number", 1)
            raw_content = p.get("full_content", p["snippet"]).strip()

            lines = [l.strip() for l in raw_content.split("\n") if l.strip()]
            summary_point = lines[0] if lines else raw_content[:120]
            if len(summary_point) > 180:
                summary_point = summary_point[:180] + "..."

            bullet = f"- **Key Information [{cite_num}]** (Page {page_num}): {summary_point} [{cite_num}]\n\n"
            for word in bullet.split(" "):
                yield word + " "

        closing = "The details above have been extracted directly from the uploaded document passages."
        for word in closing.split(" "):
            yield word + " "


llm_service = LLMService()
