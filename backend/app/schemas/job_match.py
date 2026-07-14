import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.cv_analysis import AnalysisStatus


class SkillGapItem(BaseModel):
    skill: str
    priority: Literal["low", "medium", "high"]
    estimated_learning_time: str


class JobMatchResult(BaseModel):
    """AI sağlayıcısından beklenen, doğrulanmış CV <-> iş ilanı eşleşme sonucu."""

    compatibility_score: int = Field(
        ge=0,
        le=100,
        description=(
            "AI destekli tahmin: CV analizindeki ats_score'un aksine, backend "
            "tarafından bağımsız bir kural motoruyla yeniden hesaplanmaz — "
            "0-100 aralığına sıkıştırılır ama değerin kendisi AI modelinden gelir."
        ),
    )
    ats_match_score: int = Field(
        ge=0,
        le=100,
        description=(
            "AI destekli tahmin (CV analizindeki deterministik ats_score ile "
            "KARIŞTIRILMAMALI) — bu skor, backend'de bağımsız olarak doğrulanmaz."
        ),
    )
    matched_skills: list[str]
    missing_skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
    missing_keywords: list[str]
    hiring_probability: int = Field(
        ge=0, le=100, description="AI destekli tahmin, backend tarafından doğrulanmaz."
    )
    seniority_fit: str
    skill_gap: list[SkillGapItem]


class JobMatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_description_id: uuid.UUID
    cv_document_id: uuid.UUID
    status: AnalysisStatus
    result: JobMatchResult | None
    error_message: str | None
    created_at: datetime


class JobMatchHistoryItem(JobMatchRead):
    job_title: str
    cv_file_name: str


class SalaryEstimationRequest(BaseModel):
    country: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
