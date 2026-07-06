"""AI analiz sağlayıcıları için soyut arayüz.

Bugün OpenAI kullanılıyor; ileride Claude/Gemini eklenirse sadece bu arayüzü
uygulayan yeni bir sınıf eklenir, servis katmanı değişmeden kalır.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.schemas.cv_analysis import CVAnalysisResult
from app.schemas.job_match import JobMatchResult


class AIProviderError(Exception):
    """Sağlayıcıdan geçerli/şemaya uygun bir analiz alınamadığında fırlatılır."""


@dataclass(frozen=True)
class AIUsage:
    """Tek bir OpenAI çağrısının token kullanımı (Faz 7 maliyet takibi için).

    Mock provider gerçek bir API çağrısı yapmadığı için her zaman None döner —
    admin metrikleri sadece gerçek harcamayı yansıtsın diye.
    """

    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class CVAnalysisProvider(ABC):
    @abstractmethod
    async def analyze(self, cv_text: str) -> tuple[CVAnalysisResult, AIUsage | None]:
        """CV metnini analiz eder ve doğrulanmış bir sonuç + kullanım bilgisini döner."""

    @abstractmethod
    async def generate_text(
        self, *, system_prompt: str, user_prompt: str
    ) -> tuple[str, AIUsage | None]:
        """Serbest metin üretir (Faz 5 rewrite/cover-letter/LinkedIn araçları için)."""

    @abstractmethod
    async def match_job(
        self, *, cv_text: str, job_title: str, job_description: str
    ) -> tuple[JobMatchResult, AIUsage | None]:
        """CV'yi bir iş ilanıyla karşılaştırır ve doğrulanmış bir eşleşme sonucu döner (Faz 6)."""
