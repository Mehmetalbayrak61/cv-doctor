import uuid

from fastapi import APIRouter, status

from app.core.dependencies import CurrentUser, DbSession, VerifiedUser
from app.schemas.rewrite import AIOutputRead, AtsOptimizeRequest, CoverLetterRequest
from app.services.rewrite_service import RewriteService

router = APIRouter(prefix="/cvs", tags=["ai-rewrite"])


@router.post(
    "/{cv_id}/rewrite-summary", response_model=AIOutputRead, status_code=status.HTTP_201_CREATED
)
async def rewrite_summary(
    cv_id: uuid.UUID, db: DbSession, current_user: VerifiedUser
) -> AIOutputRead:
    output = await RewriteService(db).rewrite_summary(user=current_user, document_id=cv_id)
    return AIOutputRead.model_validate(output)


@router.post(
    "/{cv_id}/rewrite-experience", response_model=AIOutputRead, status_code=status.HTTP_201_CREATED
)
async def rewrite_experience(
    cv_id: uuid.UUID, db: DbSession, current_user: VerifiedUser
) -> AIOutputRead:
    output = await RewriteService(db).rewrite_experience(user=current_user, document_id=cv_id)
    return AIOutputRead.model_validate(output)


@router.post(
    "/{cv_id}/rewrite-skills", response_model=AIOutputRead, status_code=status.HTTP_201_CREATED
)
async def rewrite_skills(
    cv_id: uuid.UUID, db: DbSession, current_user: VerifiedUser
) -> AIOutputRead:
    output = await RewriteService(db).rewrite_skills(user=current_user, document_id=cv_id)
    return AIOutputRead.model_validate(output)


@router.post(
    "/{cv_id}/ats-optimize", response_model=AIOutputRead, status_code=status.HTTP_201_CREATED
)
async def ats_optimize(
    cv_id: uuid.UUID,
    db: DbSession,
    current_user: VerifiedUser,
    payload: AtsOptimizeRequest | None = None,
) -> AIOutputRead:
    target_job_title = payload.target_job_title if payload else None
    output = await RewriteService(db).ats_optimize(
        user=current_user, document_id=cv_id, target_job_title=target_job_title
    )
    return AIOutputRead.model_validate(output)


@router.post(
    "/{cv_id}/cover-letter", response_model=AIOutputRead, status_code=status.HTTP_201_CREATED
)
async def generate_cover_letter(
    cv_id: uuid.UUID, payload: CoverLetterRequest, db: DbSession, current_user: VerifiedUser
) -> AIOutputRead:
    output = await RewriteService(db).generate_cover_letter(
        user=current_user,
        document_id=cv_id,
        job_title=payload.job_title,
        company_name=payload.company_name,
        job_description=payload.job_description,
    )
    return AIOutputRead.model_validate(output)


@router.post(
    "/{cv_id}/linkedin-summary", response_model=AIOutputRead, status_code=status.HTTP_201_CREATED
)
async def generate_linkedin_summary(
    cv_id: uuid.UUID, db: DbSession, current_user: VerifiedUser
) -> AIOutputRead:
    output = await RewriteService(db).generate_linkedin_summary(
        user=current_user, document_id=cv_id
    )
    return AIOutputRead.model_validate(output)


@router.get("/{cv_id}/ai-outputs", response_model=list[AIOutputRead])
async def list_ai_outputs(
    cv_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> list[AIOutputRead]:
    outputs = await RewriteService(db).list_outputs(user=current_user, document_id=cv_id)
    return [AIOutputRead.model_validate(output) for output in outputs]
