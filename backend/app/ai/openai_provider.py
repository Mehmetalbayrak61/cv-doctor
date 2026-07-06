import json
from typing import TypeVar

from openai import APIError
from openai.types.chat import ChatCompletion
from pydantic import BaseModel, ValidationError

from app.ai.base import AIProviderError, AIUsage, CVAnalysisProvider
from app.ai.job_prompts import build_job_match_messages
from app.ai.prompts import build_messages
from app.core.config import settings
from app.schemas.cv_analysis import CVAnalysisResult
from app.schemas.job_match import JobMatchResult

ResultT = TypeVar("ResultT", bound=BaseModel)


def _extract_usage(response: ChatCompletion) -> AIUsage | None:
    usage = response.usage
    if usage is None:
        return None
    return AIUsage(
        model=response.model,
        prompt_tokens=usage.prompt_tokens,
        completion_tokens=usage.completion_tokens,
        total_tokens=usage.total_tokens,
    )


class OpenAIProvider(CVAnalysisProvider):
    def __init__(self) -> None:
        # Lazy import: openai paketi sadece bu sağlayıcı gerçekten kullanıldığında yüklenir.
        from openai import AsyncOpenAI

        self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def _request_json(
        self, *, messages: list[dict[str, str]], result_model: type[ResultT]
    ) -> tuple[ResultT, AIUsage | None]:
        try:
            response = await self._client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0,
            )
        except APIError as exc:
            raise AIProviderError(f"OpenAI isteği başarısız oldu: {exc}") from exc

        raw_content = response.choices[0].message.content
        if not raw_content:
            raise AIProviderError("OpenAI boş yanıt döndürdü.")

        try:
            payload = json.loads(raw_content)
        except json.JSONDecodeError as exc:
            raise AIProviderError("OpenAI geçerli bir JSON döndürmedi.") from exc

        try:
            result = result_model.model_validate(payload)
        except ValidationError as exc:
            raise AIProviderError(f"OpenAI yanıtı beklenen şemaya uymuyor: {exc}") from exc

        return result, _extract_usage(response)

    async def analyze(self, cv_text: str) -> tuple[CVAnalysisResult, AIUsage | None]:
        return await self._request_json(
            messages=build_messages(cv_text), result_model=CVAnalysisResult
        )

    async def match_job(
        self, *, cv_text: str, job_title: str, job_description: str
    ) -> tuple[JobMatchResult, AIUsage | None]:
        messages = build_job_match_messages(
            cv_text=cv_text, job_title=job_title, job_description=job_description
        )
        return await self._request_json(messages=messages, result_model=JobMatchResult)

    async def generate_text(
        self, *, system_prompt: str, user_prompt: str
    ) -> tuple[str, AIUsage | None]:
        try:
            response = await self._client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.5,
            )
        except APIError as exc:
            raise AIProviderError(f"OpenAI isteği başarısız oldu: {exc}") from exc

        content = response.choices[0].message.content
        if not content or not content.strip():
            raise AIProviderError("OpenAI boş yanıt döndürdü.")
        return content.strip(), _extract_usage(response)
