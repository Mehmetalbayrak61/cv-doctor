from types import SimpleNamespace

import pytest

from app.core.dependencies import get_verified_user
from app.core.exceptions import ForbiddenError


async def test_unverified_user_cannot_use_ai_features() -> None:
    user = SimpleNamespace(is_email_verified=False)
    with pytest.raises(ForbiddenError):
        await get_verified_user(user)  # type: ignore[arg-type]


async def test_verified_user_can_use_ai_features() -> None:
    user = SimpleNamespace(is_email_verified=True)
    assert await get_verified_user(user) is user  # type: ignore[arg-type]
