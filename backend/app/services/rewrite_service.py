import uuid
from collections.abc import Callable
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.base import AIProviderError
from app.ai.factory import get_ai_provider
from app.ai.job_prompts import (
    build_interview_prep_prompt,
    build_keyword_optimize_prompt,
    build_salary_estimation_prompt,
)
from app.ai.rewrite_prompts import (
    build_ats_optimize_prompt,
    build_cover_letter_prompt,
    build_experience_rewrite_prompt,
    build_linkedin_summary_prompt,
    build_skills_rewrite_prompt,
    build_summary_rewrite_prompt,
)
from app.core.config import settings
from app.core.exceptions import AIAnalysisError, NotFoundError, RateLimitError
from app.models.ai_output import AIOutput, AIOutputType
from app.models.ai_usage_log import AIUsageFeature
from app.models.cv_analysis import AnalysisStatus
from app.models.user import User
from app.repositories.ai_output_repository import AIOutputRepository
from app.repositories.ai_usage_repository import AIUsageRepository
from app.services.ai_usage_recorder import record_ai_usage
from app.services.cv_service import CVService
from app.services.cv_text_service import CvTextService
from app.services.job_description_service import JobDescriptionService
from app.services.job_match_service import JobMatchService


class RewriteService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._cv_service = CVService(db)
        self._job_service = JobDescriptionService(db)
        self._match_service = JobMatchService(db)
        self._text_service = CvTextService()
        self._repo = AIOutputRepository(db)
        self._usage_repo = AIUsageRepository(db)
        self._provider = get_ai_provider()

    async def _enforce_rate_limit(self, user_id: uuid.UUID) -> None:
        window_start = datetime.now(UTC) - timedelta(hours=1)
        recent_count = await self._repo.count_recent_by_user(user_id, since=window_start)
        if recent_count >= settings.AI_RATE_LIMIT_PER_HOUR:
            raise RateLimitError(
                f"Saatlik AI kullanım limitine ({settings.AI_RATE_LIMIT_PER_HOUR}) ulaştınız. "
                "Lütfen daha sonra tekrar deneyin."
            )

    async def _generate_and_store(
        self,
        *,
        user: User,
        document_id: uuid.UUID,
        output_type: AIOutputType,
        build_prompt: Callable[[str], tuple[str, str]],
        input_context: dict | None = None,
        job_description_id: uuid.UUID | None = None,
    ) -> AIOutput:
        """Ortak akış: sahiplik + rate limit kontrolü -> metin çıkar -> üret -> kaydet."""
        document = await self._cv_service.get_owned(user=user, document_id=document_id)
        await self._enforce_rate_limit(user.id)
        text = await self._text_service.extract(document)
        system_prompt, user_prompt = build_prompt(text)

        try:
            content, usage = await self._provider.generate_text(
                system_prompt=system_prompt, user_prompt=user_prompt
            )
        except AIProviderError as exc:
            raise AIAnalysisError("AI çıktısı üretilemedi, lütfen tekrar deneyin.") from exc

        output = await self._repo.create(
            cv_document_id=document.id,
            user_id=user.id,
            output_type=output_type,
            content=content,
            input_context=input_context,
            job_description_id=job_description_id,
        )
        await record_ai_usage(
            self._usage_repo, user_id=user.id, feature=AIUsageFeature.REWRITE, usage=usage
        )
        await self._db.commit()
        return output

    async def rewrite_summary(self, *, user: User, document_id: uuid.UUID) -> AIOutput:
        return await self._generate_and_store(
            user=user,
            document_id=document_id,
            output_type=AIOutputType.SUMMARY_REWRITE,
            build_prompt=build_summary_rewrite_prompt,
        )

    async def rewrite_experience(self, *, user: User, document_id: uuid.UUID) -> AIOutput:
        return await self._generate_and_store(
            user=user,
            document_id=document_id,
            output_type=AIOutputType.EXPERIENCE_REWRITE,
            build_prompt=build_experience_rewrite_prompt,
        )

    async def rewrite_skills(self, *, user: User, document_id: uuid.UUID) -> AIOutput:
        return await self._generate_and_store(
            user=user,
            document_id=document_id,
            output_type=AIOutputType.SKILLS_REWRITE,
            build_prompt=build_skills_rewrite_prompt,
        )

    async def ats_optimize(
        self, *, user: User, document_id: uuid.UUID, target_job_title: str | None
    ) -> AIOutput:
        input_context = {"target_job_title": target_job_title} if target_job_title else None
        return await self._generate_and_store(
            user=user,
            document_id=document_id,
            output_type=AIOutputType.ATS_OPTIMIZATION,
            build_prompt=lambda text: build_ats_optimize_prompt(text, target_job_title),
            input_context=input_context,
        )

    async def generate_cover_letter(
        self,
        *,
        user: User,
        document_id: uuid.UUID,
        job_title: str,
        company_name: str | None,
        job_description: str | None,
    ) -> AIOutput:
        input_context = {
            "job_title": job_title,
            "company_name": company_name,
            "job_description": job_description,
        }
        return await self._generate_and_store(
            user=user,
            document_id=document_id,
            output_type=AIOutputType.COVER_LETTER,
            build_prompt=lambda text: build_cover_letter_prompt(
                text,
                job_title=job_title,
                company_name=company_name,
                job_description=job_description,
            ),
            input_context=input_context,
        )

    async def generate_linkedin_summary(self, *, user: User, document_id: uuid.UUID) -> AIOutput:
        return await self._generate_and_store(
            user=user,
            document_id=document_id,
            output_type=AIOutputType.LINKEDIN_SUMMARY,
            build_prompt=build_linkedin_summary_prompt,
        )

    async def list_outputs(self, *, user: User, document_id: uuid.UUID) -> list[AIOutput]:
        await self._cv_service.get_owned(user=user, document_id=document_id)
        return await self._repo.list_by_document(document_id)

    # --- Faz 6: iş ilanına bağlı (job-scoped) araçlar ---

    async def optimize_ats_keywords(
        self, *, user: User, job_id: uuid.UUID, document_id: uuid.UUID
    ) -> AIOutput:
        job = await self._job_service.get_owned(user=user, job_id=job_id)
        latest_match = await self._match_service.get_latest(
            user=user, job_id=job_id, cv_id=document_id
        )
        if latest_match.status != AnalysisStatus.COMPLETED or latest_match.result is None:
            raise NotFoundError(
                "Önce bu ilan için bir eşleştirme tamamlanmış olmalı. Lütfen önce eşleştirme yapın."
            )
        missing_keywords = latest_match.result.get("missing_keywords", [])

        return await self._generate_and_store(
            user=user,
            document_id=document_id,
            output_type=AIOutputType.ATS_KEYWORD_INSERTION,
            build_prompt=lambda text: build_keyword_optimize_prompt(text, missing_keywords),
            input_context={"missing_keywords": missing_keywords},
            job_description_id=job.id,
        )

    async def generate_job_cover_letter(
        self, *, user: User, job_id: uuid.UUID, document_id: uuid.UUID
    ) -> AIOutput:
        job = await self._job_service.get_owned(user=user, job_id=job_id)
        input_context = {
            "job_title": job.title,
            "company_name": job.company,
            "job_description": job.description,
        }
        return await self._generate_and_store(
            user=user,
            document_id=document_id,
            output_type=AIOutputType.COVER_LETTER,
            build_prompt=lambda text: build_cover_letter_prompt(
                text, job_title=job.title, company_name=job.company, job_description=job.description
            ),
            input_context=input_context,
            job_description_id=job.id,
        )

    async def generate_interview_prep(
        self, *, user: User, job_id: uuid.UUID, document_id: uuid.UUID
    ) -> AIOutput:
        job = await self._job_service.get_owned(user=user, job_id=job_id)
        return await self._generate_and_store(
            user=user,
            document_id=document_id,
            output_type=AIOutputType.INTERVIEW_PREP,
            build_prompt=lambda text: build_interview_prep_prompt(
                text, job_title=job.title, job_description=job.description
            ),
            job_description_id=job.id,
        )

    async def estimate_salary(
        self,
        *,
        user: User,
        job_id: uuid.UUID,
        document_id: uuid.UUID,
        country: str | None,
        city: str | None,
    ) -> AIOutput:
        job = await self._job_service.get_owned(user=user, job_id=job_id)
        input_context = {"country": country, "city": city}
        return await self._generate_and_store(
            user=user,
            document_id=document_id,
            output_type=AIOutputType.SALARY_ESTIMATION,
            build_prompt=lambda text: build_salary_estimation_prompt(
                text, job_title=job.title, country=country, city=city
            ),
            input_context=input_context,
            job_description_id=job.id,
        )

    async def list_job_outputs(
        self, *, user: User, job_id: uuid.UUID, document_id: uuid.UUID
    ) -> list[AIOutput]:
        await self._job_service.get_owned(user=user, job_id=job_id)
        await self._cv_service.get_owned(user=user, document_id=document_id)
        return await self._repo.list_by_document_and_job(document_id, job_id)
