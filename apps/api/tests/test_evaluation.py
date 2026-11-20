import pytest
from apps.api.src.services.llm_service import llm_service


def test_grounded_prompt_construction():
    passages = [
        {
            "citation_id": 1,
            "document_name": "FINANCIAL_REPORT.pdf",
            "page_number": 12,
            "snippet": "Q3 net revenue reached $4.2M, reflecting a 14% year-over-year increase.",
        }
    ]
    prompt = llm_service.build_grounded_prompt("What was the Q3 net revenue?", passages)
    assert "Strict Grounding Rules" in prompt
    assert "FINANCIAL_REPORT.pdf" in prompt
    assert "Q3 net revenue reached $4.2M" in prompt
    assert "Never speculate" in prompt


@pytest.mark.asyncio
async def test_llm_stream_generation():
    passages = [
        {
            "citation_id": 1,
            "document_name": "DOC.pdf",
            "snippet": "Sample passage content for stream validation.",
        }
    ]
    tokens = []
    async for token in llm_service.generate_grounded_stream("Explain the doc", passages):
        tokens.append(token)

    full_response = "".join(tokens)
    assert len(tokens) > 5
    assert "[1]" in full_response or "[2]" in full_response
