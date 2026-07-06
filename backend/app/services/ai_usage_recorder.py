import uuid

from app.ai.base import AIUsage
from app.ai.pricing import estimate_cost_usd
from app.models.ai_usage_log import AIUsageFeature
from app.repositories.ai_usage_repository import AIUsageRepository


async def record_ai_usage(
    repo: AIUsageRepository, *, user_id: uuid.UUID, feature: AIUsageFeature, usage: AIUsage | None
) -> None:
    """Gerçek bir OpenAI çağrısı sonrası kullanım kaydı yazar. Mock provider `usage=None`
    döndürdüğü için hiçbir şey yazılmaz — admin metrikleri sadece gerçek harcamayı yansıtır."""
    if usage is None:
        return

    await repo.create(
        user_id=user_id,
        feature=feature,
        model=usage.model,
        prompt_tokens=usage.prompt_tokens,
        completion_tokens=usage.completion_tokens,
        total_tokens=usage.total_tokens,
        estimated_cost_usd=estimate_cost_usd(
            model=usage.model,
            prompt_tokens=usage.prompt_tokens,
            completion_tokens=usage.completion_tokens,
        ),
    )
