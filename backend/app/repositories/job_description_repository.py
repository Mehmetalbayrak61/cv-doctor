import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job_description import JobDescription


class JobDescriptionRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        user_id: uuid.UUID,
        title: str,
        company: str | None,
        location: str | None,
        source: str | None,
        description: str,
    ) -> JobDescription:
        job = JobDescription(
            user_id=user_id,
            title=title,
            company=company,
            location=location,
            source=source,
            description=description,
        )
        self._db.add(job)
        await self._db.flush()
        await self._db.refresh(job)
        return job

    async def get_by_id(self, job_id: uuid.UUID) -> JobDescription | None:
        return await self._db.get(JobDescription, job_id)

    async def list_by_user(self, user_id: uuid.UUID) -> list[JobDescription]:
        result = await self._db.execute(
            select(JobDescription)
            .where(JobDescription.user_id == user_id)
            .order_by(JobDescription.created_at.desc())
        )
        return list(result.scalars().all())

    async def delete(self, job: JobDescription) -> None:
        await self._db.delete(job)
        await self._db.flush()
