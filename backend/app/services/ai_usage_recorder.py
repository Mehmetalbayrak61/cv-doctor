import uuid
from datetime import UTC, datetime, timedelta

from app.ai.base import AIUsage
from app.ai.pricing import estimate_cost_usd
from app.core.config import settings
from app.core.exceptions import RateLimitError
from app.models.ai_usage_log import AIUsageFeature
from app.repositories.ai_usage_repository import AIUsageRepository


async def enforce_ai_rate_limit(
    repo: AIUsageRepository, *, user_id: uuid.UUID, is_admin: bool = False
) -> None:
    """Kullanıcı başına saatlik AI kullanım limiti — CV analizi, iş eşleştirme ve rewrite
    dahil tüm gerçek OpenAI çağrılarını (bkz. AIUsageLog) ortak sayar. OpenAI çağrısından
    ÖNCE çağrılmalı ki limit aşılınca gereksiz maliyetli istek hiç yapılmasın.

    Admin hesapları (iç test amaçlı) bu limitten muaftır."""
    if is_admin:
        return

    window_start = datetime.now(UTC) - timedelta(hours=1)
    recent_count = await repo.count_recent_by_user(user_id, since=window_start)
    if recent_count >= settings.AI_RATE_LIMIT_PER_HOUR:
        raise RateLimitError("Saatlik analiz limitine ulaştınız. Lütfen daha sonra tekrar deneyin.")


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
