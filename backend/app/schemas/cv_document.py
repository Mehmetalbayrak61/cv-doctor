import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CVDocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    file_name: str
    file_size: int
    mime_type: str
    created_at: datetime


class CVDocumentListResponse(BaseModel):
    items: list[CVDocumentRead]
    total: int
