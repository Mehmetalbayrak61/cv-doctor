import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_usage_log import AIUsageFeature, AIUsageLog


class AIUsageRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def count_recent_by_user(self, user_id: uuid.UUID, *, since: datetime) -> int:
        result = await self._db.execute(
            select(func.count())
            .select_from(AIUsageLog)
            .where(AIUsageLog.user_id == user_id, AIUsageLog.created_at >= since)
        )
        return result.scalar_one()

    async def create(
        self,
        *,
        user_id: uuid.UUID,
        feature: AIUsageFeature,
        model: str,
        prompt_tokens: int,
        completion_tokens: int,
        total_tokens: int,
        estimated_cost_usd: float,
    ) -> AIUsageLog:
        log = AIUsageLog(
            user_id=user_id,
            feature=feature,
            model=model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            estimated_cost_usd=estimated_cost_usd,
        )
        self._db.add(log)
        await self._db.flush()
        await self._db.refresh(log)
        return log

    async def summary_since(self, *, since: datetime) -> dict[str, float | int]:
        result = await self._db.execute(
            select(
                func.count(),
                func.coalesce(func.sum(AIUsageLog.total_tokens), 0),
                func.coalesce(func.sum(AIUsageLog.estimated_cost_usd), 0),
            ).where(AIUsageLog.created_at >= since)
        )
        count, total_tokens, total_cost = result.one()
        return {
            "call_count": count,
            "total_tokens": total_tokens,
            "estimated_cost_usd": float(total_cost),
        }

    async def summary_by_feature_since(
        self, *, since: datetime
    ) -> dict[str, dict[str, float | int]]:
        result = await self._db.execute(
            select(
                AIUsageLog.feature,
                func.count(),
                func.coalesce(func.sum(AIUsageLog.total_tokens), 0),
                func.coalesce(func.sum(AIUsageLog.estimated_cost_usd), 0),
            )
            .where(AIUsageLog.created_at >= since)
            .group_by(AIUsageLog.feature)
        )
        return {
            feature.value: {
                "call_count": count,
                "total_tokens": total_tokens,
                "estimated_cost_usd": float(total_cost),
            }
            for feature, count, total_tokens, total_cost in result.all()
        }
