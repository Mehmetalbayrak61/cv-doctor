from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.ai_output_repository import AIOutputRepository
from app.repositories.cv_analysis_repository import CVAnalysisRepository
from app.repositories.cv_document_repository import CVDocumentRepository
from app.repositories.job_match_repository import JobMatchRepository
from app.schemas.cv_analysis import CVAnalysisRead
from app.schemas.cv_document import CVDocumentRead
from app.schemas.dashboard import (
    DashboardOverviewRead,
    RecentActivityItem,
    RecentAnalysisItem,
)


class DashboardService:
    """Dashboard için sabit sayıda sorguyla özet veri üretir."""

    def __init__(self, db: AsyncSession) -> None:
        self._documents = CVDocumentRepository(db)
        self._analyses = CVAnalysisRepository(db)
        self._outputs = AIOutputRepository(db)
        self._matches = JobMatchRepository(db)

    async def overview(self, *, user: User) -> DashboardOverviewRead:
        documents = await self._documents.list_by_user(user.id)
        completed_analyses = await self._analyses.list_completed_by_user(user.id)
        outputs = await self._outputs.list_recent_by_user(user.id, limit=6)
        job_match_count = await self._matches.count_by_user(user.id)

        documents_by_id = {document.id: document for document in documents}
        latest_by_document = {}
        for analysis in completed_analyses:
            latest_by_document.setdefault(analysis.cv_document_id, analysis)

        recent_analyses = sorted(
            latest_by_document.values(), key=lambda item: item.created_at, reverse=True
        )[:4]
        latest_document = documents[0] if documents else None
        # overall_score/ats_score, latest_cv_id ile AYNI belgeye ait olmalı — en son
        # ANALİZ EDİLEN belgenin skorunu değil, en son YÜKLENEN belgenin (varsa) kendi
        # skorunu gösteriyoruz. Aksi halde kullanıcı henüz analiz etmediği yeni bir CV
        # yüklediğinde, eski bir CV'nin skoru yanlışlıkla yeni CV'ye ait gibi görünür.
        latest_analysis = latest_by_document.get(latest_document.id) if latest_document else None
        week_ago = datetime.now(UTC) - timedelta(days=7)
        activity_last_7_days = await self._outputs.count_recent_by_user(user.id, since=week_ago)

        return DashboardOverviewRead(
            has_any_cv=bool(documents),
            total_cvs=len(documents),
            latest_cv_id=latest_document.id if latest_document else None,
            overall_score=(latest_analysis.result or {}).get("overall_score")
            if latest_analysis
            else None,
            ats_score=(latest_analysis.result or {}).get("ats_score") if latest_analysis else None,
            job_match_count=job_match_count,
            recent_analyses=[
                RecentAnalysisItem(
                    cv=CVDocumentRead.model_validate(documents_by_id[analysis.cv_document_id]),
                    analysis=CVAnalysisRead.model_validate(analysis),
                )
                for analysis in recent_analyses
                if analysis.cv_document_id in documents_by_id
            ],
            recent_activity=[
                RecentActivityItem(
                    id=output.id,
                    cv_id=output.cv_document_id,
                    cv_file_name=output.cv_document.file_name,
                    output_type=output.output_type,
                    created_at=output.created_at,
                )
                for output in outputs
            ],
            activity_last_7_days=activity_last_7_days,
        )
