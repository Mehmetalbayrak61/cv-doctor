import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.ai_output import AIOutputType


class CoverLetterRequest(BaseModel):
    job_title: str = Field(min_length=1, max_length=200)
    company_name: str | None = Field(default=None, max_length=200)
    job_description: str | None = Field(default=None, max_length=4000)


class AtsOptimizeRequest(BaseModel):
    target_job_title: str | None = Field(default=None, max_length=200)


class AIOutputRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cv_document_id: uuid.UUID
    job_description_id: uuid.UUID | None
    output_type: AIOutputType
    content: str
    input_context: dict | None
    created_at: datetime
