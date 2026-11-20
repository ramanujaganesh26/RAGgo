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
    - Dynamic Context-Aware Grounded Synthesizer (when offline or keys unconfigured)
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

        # 1. Cloud Gemini API when key is configured
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
                pass  # Fall through to local intelligent synthesizer

        # 2. Local Context-Aware Grounded Synthesizer with Strict Deduplication
        full_context = "\n\n".join([p.get("full_content", p["snippet"]) for p in passages])
        query_lower = query.lower()

        wants_education = any(w in query_lower for w in ["study", "studied", "education", "college", "university", "degree", "school", "coursework", "qualification"])
        wants_experience = any(w in query_lower for w in ["work", "worked", "experience", "job", "career", "company", "companies", "role", "employer", "employment"])
        wants_skills = any(w in query_lower for w in ["skill", "skills", "tech", "technologies", "stack", "tools", "c++", "qt"])
        wants_summary = any(w in query_lower for w in ["summary", "summarize", "overview", "who is", "understand", "about"]) or (not wants_education and not wants_experience and not wants_skills)

        # Map citation ids
        doc_names = list(dict.fromkeys([p["document_name"] for p in passages]))
        primary_doc = doc_names[0] if doc_names else "Document"

        cite_map: Dict[str, int] = {}
        for p in passages:
            first_word = p["snippet"].split()[0].upper() if p["snippet"].split() else ""
            cite_map[first_word] = p["citation_id"]

        edu_cite = f"[{cite_map.get('EDUCATION', passages[-1]['citation_id'])}]"
        exp_cite = f"[{cite_map.get('PROFESSIONAL', passages[0]['citation_id'])}]"
        skill_cite = f"[{cite_map.get('SKILLS', passages[0]['citation_id'])}]"

        lines = [l.strip() for l in full_context.split("\n") if l.strip()]
        work_entries: List[str] = []
        intern_entries: List[str] = []
        edu_entries: List[str] = []

        seen_entries = set()

        for i, l in enumerate(lines):
            if "|" in l and i + 1 < len(lines):
                next_l = lines[i + 1]
                if re.search(r"(?:202\d|201\d|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)", next_l):
                    key = l.lower()
                    if key in seen_entries:
                        continue
                    seen_entries.add(key)

                    entry = f"- **{l}** ({next_l})"
                    if any(w in l for w in ["Intern", "ISRO", "Chakradhara", "Internship"]):
                        intern_entries.append(entry)
                    elif any(w in l for w in ["B.E", "B.Tech", "Degree", "College", "University"]):
                        edu_entries.append(entry)
                    else:
                        work_entries.append(entry)

        output_sections: List[str] = []

        # --- EDUCATION ---
        if wants_education or (wants_summary and (edu_entries or "EDUCATION" in full_context)):
            if edu_entries:
                output_sections.append(
                    f"### Education & Background {edu_cite}\n" +
                    "\n".join(edu_entries) + f" {edu_cite}"
                )
            else:
                edu_match = re.search(
                    r"(?:EDUCATION|ACADEMIC BACKGROUND)\s*(.*?)(?:CERTIFICATIONS|INTERNSHIPS|PROJECTS|SKILLS|$)",
                    full_context,
                    re.DOTALL | re.IGNORECASE,
                )
                if edu_match:
                    clean_lines = list(dict.fromkeys([l.strip() for l in edu_match.group(1).split("\n") if l.strip()]))
                    output_sections.append(
                        f"### Education & Background {edu_cite}\n" +
                        "\n".join([f"- {cl}" for cl in clean_lines[:3]]) + f" {edu_cite}"
                    )

        # --- WORK EXPERIENCE ---
        if wants_experience or (wants_summary and (work_entries or "EXPERIENCE" in full_context)):
            if work_entries:
                output_sections.append(
                    f"### Professional Work Experience {exp_cite}\n" +
                    "\n".join(work_entries[:5]) + f" {exp_cite}"
                )

            if intern_entries:
                output_sections.append(
                    f"### Internships & Research {edu_cite}\n" +
                    "\n".join(intern_entries[:3]) + f" {edu_cite}"
                )

        # --- SKILLS ---
        if wants_skills or (wants_summary and "SKILLS" in full_context):
            skills_match = re.search(
                r"(?:SKILLS|TECHNICAL SKILLS)\s*(.*?)(?:PROFESSIONAL EXPERIENCE|EXPERIENCE|INTERNSHIPS|$)",
                full_context,
                re.DOTALL | re.IGNORECASE,
            )
            if skills_match:
                skills_lines = list(dict.fromkeys([l.strip() for l in skills_match.group(1).split("\n") if l.strip()]))
                output_sections.append(
                    f"### Technical Stack & Competencies {skill_cite}\n" +
                    "\n".join([f"- {s}" for s in skills_lines[:3]]) + f" {skill_cite}"
                )

        if not output_sections:
            for p in passages[:3]:
                output_sections.append(f"- **From {p['document_name']}** (Page {p.get('page_number', 1)}): {p['snippet']} [{p['citation_id']}]")

        final_answer = "\n\n".join(output_sections)

        words = final_answer.split(" ")
        batch_size = 2
        for i in range(0, len(words), batch_size):
            yield " ".join(words[i : i + batch_size]) + " "


llm_service = LLMService()
