import pytest
from pydantic import ValidationError

from app.ai.prompts import build_messages
from app.schemas.cv_analysis import CVAnalysisResult


def test_long_cv_is_not_silently_truncated_in_prompt() -> None:
    long_cv = "PROFİL\n" + "Deneyim ve başarı. " * 2_000 + "\nSON_BÖLÜM_KORUNDU"
    messages = build_messages(long_cv)
    assert len(long_cv) > 15_000
    assert messages[-1]["content"].endswith("SON_BÖLÜM_KORUNDU")


def test_prompt_forbids_job_specific_keywords_without_a_job() -> None:
    system_prompt = build_messages("örnek")[0]["content"]
    assert "missing_keywords alanını her zaman boş liste" in system_prompt
    assert "UYDURMA" in system_prompt


def test_invalid_ai_json_contract_is_rejected() -> None:
    with pytest.raises(ValidationError):
        CVAnalysisResult.model_validate({"overall_score": 150, "ats_score": "yüksek"})
