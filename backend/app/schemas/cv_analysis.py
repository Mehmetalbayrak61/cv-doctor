import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.cv_analysis import AnalysisStatus


class QualityAssessment(BaseModel):
    score: int = Field(ge=0, le=100)
    comment: str


class CVAnalysisResult(BaseModel):
    """AI sağlayıcısından beklenen, doğrulanmış analiz çıktısı.

    Bu şema hem AI yanıtını doğrulamak hem de DB'deki `result` JSONB alanının
    biçimini belgelemek için kullanılır.
    """

    overall_score: int = Field(ge=0, le=100)
    ats_score: int = Field(ge=0, le=100)
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    missing_keywords: list[str]
    improvement_suggestions: list[str]
    corrected_profile_summary: str
    suggested_job_titles: list[str]
    language_quality: QualityAssessment
    section_quality: QualityAssessment
    experience_quality: QualityAssessment
    education_quality: QualityAssessment
    skills_quality: QualityAssessment


class CVAnalysisRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cv_document_id: uuid.UUID
    version: int
    status: AnalysisStatus
    result: CVAnalysisResult | None
    error_message: str | None
    created_at: datetime
