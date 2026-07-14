import pytest
from pydantic import ValidationError

from app.schemas.job_match import JobMatchResult


def test_job_match_json_validation_accepts_complete_payload() -> None:
    result = JobMatchResult.model_validate(
        {
            "compatibility_score": 72,
            "ats_match_score": 68,
            "matched_skills": ["Python"],
            "missing_skills": ["Docker"],
            "strengths": ["İlgili deneyim"],
            "weaknesses": ["Eksik araç deneyimi"],
            "recommendations": ["Docker deneyimini belgeleyin"],
            "missing_keywords": ["Docker"],
            "hiring_probability": 50,
            "seniority_fit": "Uygun",
            "skill_gap": [
                {"skill": "Docker", "priority": "medium", "estimated_learning_time": "2 hafta"}
            ],
        }
    )
    assert result.ats_match_score == 68


def test_job_match_json_validation_rejects_out_of_range_score() -> None:
    with pytest.raises(ValidationError):
        JobMatchResult.model_validate({"compatibility_score": 120})
