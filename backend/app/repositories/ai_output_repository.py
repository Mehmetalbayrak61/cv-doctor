import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_output import AIOutput, AIOutputType


class AIOutputRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        cv_document_id: uuid.UUID,
        user_id: uuid.UUID,
        output_type: AIOutputType,
        content: str,
        input_context: dict | None,
        job_description_id: uuid.UUID | None = None,
    ) -> AIOutput:
        output = AIOutput(
            cv_document_id=cv_document_id,
            user_id=user_id,
            output_type=output_type,
            content=content,
            input_context=input_context,
            job_description_id=job_description_id,
        )
        self._db.add(output)
        await self._db.flush()
        await self._db.refresh(output)
        return output

    async def list_by_document(self, cv_document_id: uuid.UUID) -> list[AIOutput]:
        result = await self._db.execute(
            select(AIOutput)
            .where(AIOutput.cv_document_id == cv_document_id)
            .order_by(AIOutput.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_by_document_and_job(
        self, cv_document_id: uuid.UUID, job_description_id: uuid.UUID
    ) -> list[AIOutput]:
        result = await self._db.execute(
            select(AIOutput)
            .where(
                AIOutput.cv_document_id == cv_document_id,
                AIOutput.job_description_id == job_description_id,
            )
            .order_by(AIOutput.created_at.desc())
        )
        return list(result.scalars().all())

    async def count_recent_by_user(self, user_id: uuid.UUID, *, since: datetime) -> int:
        result = await self._db.execute(
            select(func.count())
            .select_from(AIOutput)
            .where(AIOutput.user_id == user_id, AIOutput.created_at >= since)
        )
        return result.scalar_one()
