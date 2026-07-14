import uuid

import pytest

from app.core.config import settings
from app.core.exceptions import RateLimitError
from app.services.ai_usage_recorder import enforce_ai_rate_limit


class FakeUsageRepository:
    def __init__(self, count: int) -> None:
        self.count = count

    async def count_recent_by_user(self, user_id: uuid.UUID, *, since: object) -> int:
        return self.count


async def test_rate_limit_blocks_at_configured_threshold() -> None:
    repo = FakeUsageRepository(settings.AI_RATE_LIMIT_PER_HOUR)
    with pytest.raises(RateLimitError):
        await enforce_ai_rate_limit(repo, user_id=uuid.uuid4())  # type: ignore[arg-type]


async def test_admin_bypasses_rate_limit() -> None:
    repo = FakeUsageRepository(settings.AI_RATE_LIMIT_PER_HOUR + 10)
    await enforce_ai_rate_limit(repo, user_id=uuid.uuid4(), is_admin=True)  # type: ignore[arg-type]


async def test_normal_user_under_the_limit_is_allowed_through() -> None:
    """Denetim raporunun bulduğu boşluk: sadece 'limitte/limit üstünde reddedilir'
    ve 'admin atlar' test ediliyordu — normal (admin olmayan) bir kullanıcının
    limit ALTINDAYKEN gerçekten GEÇTİĞİNİ doğrulayan hiçbir test yoktu. Bu, örneğin
    `if not is_admin: raise RateLimitError(...)` şeklinde bir regresyonun (tüm
    normal kullanıcıları sessizce bloke etme) diğer iki testi hiç kırmadan
    production'a çıkabilmesini engeller."""
    repo = FakeUsageRepository(settings.AI_RATE_LIMIT_PER_HOUR - 1)
    # Exception fırlatmazsa test zaten geçer; explicit assertion yok çünkü
    # enforce_ai_rate_limit başarı durumunda None döner.
    await enforce_ai_rate_limit(repo, user_id=uuid.uuid4(), is_admin=False)  # type: ignore[arg-type]
