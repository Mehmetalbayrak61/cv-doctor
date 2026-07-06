import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.job_description import JobDescription
from app.models.user import User
from app.repositories.job_description_repository import JobDescriptionRepository
from app.schemas.job import JobDescriptionCreate, JobDescriptionUpdate


class JobDescriptionService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = JobDescriptionRepository(db)

    async def create(self, *, user: User, payload: JobDescriptionCreate) -> JobDescription:
        job = await self._repo.create(
            user_id=user.id,
            title=payload.title,
            company=payload.company,
            location=payload.location,
            source=payload.source,
            description=payload.description,
        )
        await self._db.commit()
        return job

    async def list_for_user(self, *, user: User) -> list[JobDescription]:
        return await self._repo.list_by_user(user.id)

    async def get_owned(self, *, user: User, job_id: uuid.UUID) -> JobDescription:
        job = await self._repo.get_by_id(job_id)
        if job is None or job.user_id != user.id:
            raise NotFoundError("İş ilanı bulunamadı.")
        return job

    async def update(
        self, *, user: User, job_id: uuid.UUID, payload: JobDescriptionUpdate
    ) -> JobDescription:
        job = await self.get_owned(user=user, job_id=job_id)
        updates = payload.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(job, field, value)
        await self._db.commit()
        await self._db.refresh(job)
        return job

    async def delete(self, *, user: User, job_id: uuid.UUID) -> None:
        job = await self.get_owned(user=user, job_id=job_id)
        await self._repo.delete(job)
        await self._db.commit()
