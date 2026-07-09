import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.base import AIProviderError
from app.ai.factory import get_ai_provider
from app.core.exceptions import AIAnalysisError, NotFoundError
from app.models.ai_usage_log import AIUsageFeature
from app.models.cv_analysis import AnalysisStatus, CVAnalysis
from app.models.user import User
from app.repositories.ai_usage_repository import AIUsageRepository
from app.repositories.cv_analysis_repository import CVAnalysisRepository
from app.services.ai_usage_recorder import enforce_ai_rate_limit, record_ai_usage
from app.services.cv_service import CVService
from app.services.cv_text_service import CvTextService


class CVAnalysisService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._cv_service = CVService(db)
        self._repo = CVAnalysisRepository(db)
        self._usage_repo = AIUsageRepository(db)
        self._text_service = CvTextService()
        self._provider = get_ai_provider()

    async def analyze(self, *, user: User, document_id: uuid.UUID) -> CVAnalysis:
        document = await self._cv_service.get_owned(user=user, document_id=document_id)
        await enforce_ai_rate_limit(self._usage_repo, user_id=user.id)
        text = await self._text_service.extract(document)

        next_version = await self._repo.get_next_version(document.id)

        try:
            result, usage = await self._provider.analyze(text)
        except AIProviderError as exc:
            await self._repo.create(
                cv_document_id=document.id,
                user_id=user.id,
                version=next_version,
                status=AnalysisStatus.FAILED,
                result=None,
                error_message=str(exc),
            )
            await self._db.commit()
            raise AIAnalysisError("CV analizi tamamlanamadı, lütfen tekrar deneyin.") from exc

        analysis = await self._repo.create(
            cv_document_id=document.id,
            user_id=user.id,
            version=next_version,
            status=AnalysisStatus.COMPLETED,
            result=result.model_dump(mode="json"),
            error_message=None,
        )
        await record_ai_usage(
            self._usage_repo, user_id=user.id, feature=AIUsageFeature.CV_ANALYSIS, usage=usage
        )
        await self._db.commit()
        return analysis

    async def get_latest(self, *, user: User, document_id: uuid.UUID) -> CVAnalysis:
        await self._cv_service.get_owned(user=user, document_id=document_id)

        analysis = await self._repo.get_latest_by_document(document_id)
        if analysis is None:
            raise NotFoundError("Bu CV için henüz analiz yapılmamış.")
        return analysis
