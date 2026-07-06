import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cv_analysis import AnalysisStatus, CVAnalysis


class CVAnalysisRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_next_version(self, cv_document_id: uuid.UUID) -> int:
        result = await self._db.execute(
            select(func.max(CVAnalysis.version)).where(CVAnalysis.cv_document_id == cv_document_id)
        )
        current_max = result.scalar_one_or_none()
        return (current_max or 0) + 1

    async def create(
        self,
        *,
        cv_document_id: uuid.UUID,
        user_id: uuid.UUID,
        version: int,
        status: AnalysisStatus,
        result: dict | None,
        error_message: str | None,
    ) -> CVAnalysis:
        analysis = CVAnalysis(
            cv_document_id=cv_document_id,
            user_id=user_id,
            version=version,
            status=status,
            result=result,
            error_message=error_message,
        )
        self._db.add(analysis)
        await self._db.flush()
        await self._db.refresh(analysis)
        return analysis

    async def get_latest_by_document(self, cv_document_id: uuid.UUID) -> CVAnalysis | None:
        result = await self._db.execute(
            select(CVAnalysis)
            .where(CVAnalysis.cv_document_id == cv_document_id)
            .order_by(CVAnalysis.version.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
