import uuid

from fastapi import APIRouter, status

from app.core.dependencies import CurrentUser, DbSession, VerifiedUser
from app.models.job_match import JobMatch
from app.schemas.job import JobDescriptionCreate, JobDescriptionRead, JobDescriptionUpdate
from app.schemas.job_match import JobMatchHistoryItem, JobMatchRead, SalaryEstimationRequest
from app.schemas.rewrite import AIOutputRead
from app.services.job_description_service import JobDescriptionService
from app.services.job_match_service import JobMatchService
from app.services.rewrite_service import RewriteService

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _to_history_item(match: JobMatch) -> JobMatchHistoryItem:
    return JobMatchHistoryItem(
        **JobMatchRead.model_validate(match).model_dump(),
        job_title=match.job_description.title,
        cv_file_name=match.cv_document.file_name,
    )


# --- Job Description CRUD ---


@router.post("", response_model=JobDescriptionRead, status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: JobDescriptionCreate, db: DbSession, current_user: CurrentUser
) -> JobDescriptionRead:
    job = await JobDescriptionService(db).create(user=current_user, payload=payload)
    return JobDescriptionRead.model_validate(job)


@router.get("", response_model=list[JobDescriptionRead])
async def list_jobs(db: DbSession, current_user: CurrentUser) -> list[JobDescriptionRead]:
    jobs = await JobDescriptionService(db).list_for_user(user=current_user)
    return [JobDescriptionRead.model_validate(job) for job in jobs]


# NOT: "/matches" sabit yolu, "/{job_id}" dinamik yolundan ÖNCE tanımlanmalı;
# FastAPI rotaları tanım sırasına göre eşleştirir, aksi halde "matches" bir job_id
# olarak yorumlanmaya çalışılıp UUID doğrulama hatası verir.
@router.get("/matches", response_model=list[JobMatchHistoryItem])
async def list_match_history(db: DbSession, current_user: CurrentUser) -> list[JobMatchHistoryItem]:
    matches = await JobMatchService(db).list_history(user=current_user)
    return [_to_history_item(match) for match in matches]


@router.get("/{job_id}", response_model=JobDescriptionRead)
async def get_job(
    job_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> JobDescriptionRead:
    job = await JobDescriptionService(db).get_owned(user=current_user, job_id=job_id)
    return JobDescriptionRead.model_validate(job)


@router.patch("/{job_id}", response_model=JobDescriptionRead)
async def update_job(
    job_id: uuid.UUID, payload: JobDescriptionUpdate, db: DbSession, current_user: CurrentUser
) -> JobDescriptionRead:
    job = await JobDescriptionService(db).update(user=current_user, job_id=job_id, payload=payload)
    return JobDescriptionRead.model_validate(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: uuid.UUID, db: DbSession, current_user: CurrentUser) -> None:
    await JobDescriptionService(db).delete(user=current_user, job_id=job_id)


# --- Job Matching ---


@router.post(
    "/{job_id}/match/{cv_id}", response_model=JobMatchRead, status_code=status.HTTP_201_CREATED
)
async def create_match(
    job_id: uuid.UUID, cv_id: uuid.UUID, db: DbSession, current_user: VerifiedUser
) -> JobMatchRead:
    match = await JobMatchService(db).match(user=current_user, job_id=job_id, cv_id=cv_id)
    return JobMatchRead.model_validate(match)


@router.get("/{job_id}/match/{cv_id}", response_model=JobMatchRead)
async def get_latest_match(
    job_id: uuid.UUID, cv_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> JobMatchRead:
    match = await JobMatchService(db).get_latest(user=current_user, job_id=job_id, cv_id=cv_id)
    return JobMatchRead.model_validate(match)


# --- Job-scoped AI araçları ---


@router.post(
    "/{job_id}/optimize-keywords/{cv_id}",
    response_model=AIOutputRead,
    status_code=status.HTTP_201_CREATED,
)
async def optimize_keywords(
    job_id: uuid.UUID, cv_id: uuid.UUID, db: DbSession, current_user: VerifiedUser
) -> AIOutputRead:
    output = await RewriteService(db).optimize_ats_keywords(
        user=current_user, job_id=job_id, document_id=cv_id
    )
    return AIOutputRead.model_validate(output)


@router.post(
    "/{job_id}/cover-letter/{cv_id}",
    response_model=AIOutputRead,
    status_code=status.HTTP_201_CREATED,
)
async def job_cover_letter(
    job_id: uuid.UUID, cv_id: uuid.UUID, db: DbSession, current_user: VerifiedUser
) -> AIOutputRead:
    output = await RewriteService(db).generate_job_cover_letter(
        user=current_user, job_id=job_id, document_id=cv_id
    )
    return AIOutputRead.model_validate(output)


@router.post(
    "/{job_id}/interview-prep/{cv_id}",
    response_model=AIOutputRead,
    status_code=status.HTTP_201_CREATED,
)
async def interview_prep(
    job_id: uuid.UUID, cv_id: uuid.UUID, db: DbSession, current_user: VerifiedUser
) -> AIOutputRead:
    output = await RewriteService(db).generate_interview_prep(
        user=current_user, job_id=job_id, document_id=cv_id
    )
    return AIOutputRead.model_validate(output)


@router.post(
    "/{job_id}/salary-estimate/{cv_id}",
    response_model=AIOutputRead,
    status_code=status.HTTP_201_CREATED,
)
async def salary_estimate(
    job_id: uuid.UUID,
    cv_id: uuid.UUID,
    db: DbSession,
    current_user: VerifiedUser,
    payload: SalaryEstimationRequest | None = None,
) -> AIOutputRead:
    country = payload.country if payload else None
    city = payload.city if payload else None
    output = await RewriteService(db).estimate_salary(
        user=current_user, job_id=job_id, document_id=cv_id, country=country, city=city
    )
    return AIOutputRead.model_validate(output)


@router.get("/{job_id}/ai-outputs/{cv_id}", response_model=list[AIOutputRead])
async def list_job_ai_outputs(
    job_id: uuid.UUID, cv_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> list[AIOutputRead]:
    outputs = await RewriteService(db).list_job_outputs(
        user=current_user, job_id=job_id, document_id=cv_id
    )
    return [AIOutputRead.model_validate(output) for output in outputs]
