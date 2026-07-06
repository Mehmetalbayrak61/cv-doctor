from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base
from app.models.ai_output import AIOutput
from app.models.cv_analysis import CVAnalysis
from app.models.cv_document import CVDocument
from app.models.job_description import JobDescription
from app.models.job_match import JobMatch
from app.models.user import User
from app.repositories.ai_usage_repository import AIUsageRepository
from app.schemas.admin import AdminMetrics, UsageSummary


class AdminService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._usage_repo = AIUsageRepository(db)

    async def _count(self, model: type[Base]) -> int:
        result = await self._db.execute(select(func.count()).select_from(model))
        return result.scalar_one()

    async def get_metrics(self) -> AdminMetrics:
        total_users = await self._count(User)
        verified_result = await self._db.execute(
            select(func.count()).select_from(User).where(User.is_email_verified.is_(True))
        )
        verified_users = verified_result.scalar_one()

        now = datetime.now(UTC)
        usage_24h = await self._usage_repo.summary_since(since=now - timedelta(hours=24))
        usage_7d = await self._usage_repo.summary_since(since=now - timedelta(days=7))
        usage_30d = await self._usage_repo.summary_since(since=now - timedelta(days=30))
        usage_by_feature = await self._usage_repo.summary_by_feature_since(
            since=now - timedelta(days=30)
        )

        return AdminMetrics(
            total_users=total_users,
            verified_users=verified_users,
            total_cv_documents=await self._count(CVDocument),
            total_cv_analyses=await self._count(CVAnalysis),
            total_job_descriptions=await self._count(JobDescription),
            total_job_matches=await self._count(JobMatch),
            total_ai_outputs=await self._count(AIOutput),
            ai_usage_last_24h=UsageSummary(**usage_24h),
            ai_usage_last_7d=UsageSummary(**usage_7d),
            ai_usage_last_30d=UsageSummary(**usage_30d),
            ai_usage_by_feature_last_30d={
                feature: UsageSummary(**summary) for feature, summary in usage_by_feature.items()
            },
        )
