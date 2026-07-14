import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.cv_analysis import AnalysisStatus


class QualityAssessment(BaseModel):
    score: int = Field(ge=0, le=100)
    comment: str


class ScoreCriterion(BaseModel):
    """Açıklanabilir skorun tek bir sabit kriteri."""

    key: str
    label: str
    score: int = Field(ge=0, le=100)
    weight: int = Field(ge=0, le=100)
    findings: list[str] = Field(default_factory=list)


class CVAnalysisResult(BaseModel):
    """AI sağlayıcısından beklenen, doğrulanmış analiz çıktısı.

    Bu şema hem AI yanıtını doğrulamak hem de DB'deki `result` JSONB alanının
    biçimini belgelemek için kullanılır.
    """

    overall_score: int = Field(
        ge=0,
        le=100,
        description=(
            "AI destekli: backend sabit ağırlıklarla topluyor, ama alt bileşen "
            "değerlerinin kendisi AI modelinin verdiği alt-skorlardır (bkz. "
            "overall_breakdown)."
        ),
    )
    ats_score: int = Field(
        ge=0,
        le=100,
        description=(
            "Deterministik: yalnızca CV metninin backend'de regex/kural tabanlı "
            "analiziyle hesaplanır (bölüm başlıkları, iletişim bilgisi, tarih "
            "yoğunluğu vb.) — AI modelinin önerdiği değer kullanılmaz, backend "
            "tarafından tamamen yeniden hesaplanır (bkz. ats_breakdown)."
        ),
    )
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
    scoring_method: str = "legacy"
    ats_breakdown: list[ScoreCriterion] = Field(default_factory=list)
    overall_breakdown: list[ScoreCriterion] = Field(default_factory=list)


class CVAnalysisRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cv_document_id: uuid.UUID
    version: int
    status: AnalysisStatus
    result: CVAnalysisResult | None
    error_message: str | None
    created_at: datetime
