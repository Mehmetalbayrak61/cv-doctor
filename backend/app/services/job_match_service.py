import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.base import AIProviderError
from app.ai.factory import get_ai_provider
from app.core.exceptions import AIAnalysisError, NotFoundError
from app.models.ai_usage_log import AIUsageFeature
from app.models.cv_analysis import AnalysisStatus
from app.models.job_match import JobMatch
from app.models.user import User
from app.repositories.ai_usage_repository import AIUsageRepository
from app.repositories.job_match_repository import JobMatchRepository
from app.services.ai_usage_recorder import enforce_ai_rate_limit, record_ai_usage
from app.services.cv_service import CVService
from app.services.cv_text_service import CvTextService
from app.services.job_description_service import JobDescriptionService


class JobMatchService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._cv_service = CVService(db)
        self._job_service = JobDescriptionService(db)
        self._text_service = CvTextService()
        self._repo = JobMatchRepository(db)
        self._usage_repo = AIUsageRepository(db)
        self._provider = get_ai_provider()

    async def match(self, *, user: User, job_id: uuid.UUID, cv_id: uuid.UUID) -> JobMatch:
        job = await self._job_service.get_owned(user=user, job_id=job_id)
        document = await self._cv_service.get_owned(user=user, document_id=cv_id)
        await enforce_ai_rate_limit(self._usage_repo, user_id=user.id)
        cv_text = await self._text_service.extract(document)

        try:
            result, usage = await self._provider.match_job(
                cv_text=cv_text, job_title=job.title, job_description=job.description
            )
        except AIProviderError as exc:
            await self._repo.create(
                user_id=user.id,
                job_description_id=job.id,
                cv_document_id=document.id,
                status=AnalysisStatus.FAILED,
                result=None,
                error_message=str(exc),
            )
            await self._db.commit()
            raise AIAnalysisError("Eşleştirme tamamlanamadı, lütfen tekrar deneyin.") from exc

        match = await self._repo.create(
            user_id=user.id,
            job_description_id=job.id,
            cv_document_id=document.id,
            status=AnalysisStatus.COMPLETED,
            result=result.model_dump(mode="json"),
            error_message=None,
        )
        await record_ai_usage(
            self._usage_repo, user_id=user.id, feature=AIUsageFeature.JOB_MATCH, usage=usage
        )
        await self._db.commit()
        return match

    async def get_latest(self, *, user: User, job_id: uuid.UUID, cv_id: uuid.UUID) -> JobMatch:
        await self._job_service.get_owned(user=user, job_id=job_id)
        await self._cv_service.get_owned(user=user, document_id=cv_id)

        match = await self._repo.get_latest(job_description_id=job_id, cv_document_id=cv_id)
        if match is None:
            raise NotFoundError("Bu CV ve ilan için henüz eşleştirme yapılmamış.")
        return match

    async def list_history(self, *, user: User) -> list[JobMatch]:
        return await self._repo.list_by_user(user.id)
