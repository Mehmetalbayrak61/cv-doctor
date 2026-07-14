import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.cv_analysis import AnalysisStatus
from app.models.job_match import JobMatch


class JobMatchRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        user_id: uuid.UUID,
        job_description_id: uuid.UUID,
        cv_document_id: uuid.UUID,
        status: AnalysisStatus,
        result: dict | None,
        error_message: str | None,
    ) -> JobMatch:
        match = JobMatch(
            user_id=user_id,
            job_description_id=job_description_id,
            cv_document_id=cv_document_id,
            status=status,
            result=result,
            error_message=error_message,
        )
        self._db.add(match)
        await self._db.flush()
        await self._db.refresh(match)
        return match

    async def get_latest(
        self, *, job_description_id: uuid.UUID, cv_document_id: uuid.UUID
    ) -> JobMatch | None:
        result = await self._db.execute(
            select(JobMatch)
            .where(
                JobMatch.job_description_id == job_description_id,
                JobMatch.cv_document_id == cv_document_id,
            )
            .order_by(JobMatch.created_at.desc())
            .limit(1)
        )
        return result.scalars().first()

    async def list_by_user(self, user_id: uuid.UUID) -> list[JobMatch]:
        result = await self._db.execute(
            select(JobMatch)
            .where(JobMatch.user_id == user_id)
            .options(joinedload(JobMatch.job_description), joinedload(JobMatch.cv_document))
            .order_by(JobMatch.created_at.desc())
        )
        return list(result.scalars().all())

    async def count_by_user(self, user_id: uuid.UUID) -> int:
        result = await self._db.execute(
            select(func.count()).select_from(JobMatch).where(JobMatch.user_id == user_id)
        )
        return result.scalar_one()
