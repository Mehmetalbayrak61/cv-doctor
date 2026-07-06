import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

# Çok kısa/anlamsız ilan metinlerini ("bozuk ilan") en baştan reddetmek için minimum uzunluk.
MIN_JOB_DESCRIPTION_LENGTH = 30


class JobDescriptionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    company: str | None = Field(default=None, max_length=200)
    location: str | None = Field(default=None, max_length=200)
    source: str | None = Field(default=None, max_length=100)
    description: str = Field(min_length=MIN_JOB_DESCRIPTION_LENGTH, max_length=20000)


class JobDescriptionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    company: str | None = Field(default=None, max_length=200)
    location: str | None = Field(default=None, max_length=200)
    source: str | None = Field(default=None, max_length=100)
    description: str | None = Field(
        default=None, min_length=MIN_JOB_DESCRIPTION_LENGTH, max_length=20000
    )


class JobDescriptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    company: str | None
    location: str | None
    source: str | None
    description: str
    created_at: datetime
