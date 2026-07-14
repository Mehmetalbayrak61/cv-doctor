import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.ai_output import AIOutputType
from app.schemas.cv_analysis import CVAnalysisRead
from app.schemas.cv_document import CVDocumentRead


class RecentAnalysisItem(BaseModel):
    cv: CVDocumentRead
    analysis: CVAnalysisRead


class RecentActivityItem(BaseModel):
    id: uuid.UUID
    cv_id: uuid.UUID
    cv_file_name: str
    output_type: AIOutputType
    created_at: datetime


class DashboardOverviewRead(BaseModel):
    has_any_cv: bool
    total_cvs: int
    latest_cv_id: uuid.UUID | None
    overall_score: int | None
    ats_score: int | None
    job_match_count: int
    recent_analyses: list[RecentAnalysisItem]
    recent_activity: list[RecentActivityItem]
    activity_last_7_days: int
