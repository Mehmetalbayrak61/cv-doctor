from functools import lru_cache

from app.ai.base import CVAnalysisProvider
from app.core.config import settings


@lru_cache
def get_ai_provider() -> CVAnalysisProvider:
    if settings.OPENAI_API_KEY:
        from app.ai.openai_provider import OpenAIProvider

        return OpenAIProvider()

    from app.ai.mock_provider import MockAIProvider

    return MockAIProvider()
