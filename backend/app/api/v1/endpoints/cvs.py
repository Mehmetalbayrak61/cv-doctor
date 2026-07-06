import uuid

from fastapi import APIRouter, File, UploadFile, status

from app.core.dependencies import CurrentUser, DbSession, VerifiedUser
from app.schemas.cv_analysis import CVAnalysisRead
from app.schemas.cv_document import CVDocumentListResponse, CVDocumentRead
from app.services.cv_analysis_service import CVAnalysisService
from app.services.cv_service import CVService

router = APIRouter(prefix="/cvs", tags=["cvs"])


@router.post("", response_model=CVDocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_cv(
    db: DbSession,
    current_user: CurrentUser,
    file: UploadFile = File(...),
) -> CVDocumentRead:
    document = await CVService(db).upload(user=current_user, file=file)
    return CVDocumentRead.model_validate(document)


@router.get("", response_model=CVDocumentListResponse)
async def list_cvs(db: DbSession, current_user: CurrentUser) -> CVDocumentListResponse:
    documents = await CVService(db).list_for_user(user=current_user)
    return CVDocumentListResponse(
        items=[CVDocumentRead.model_validate(doc) for doc in documents], total=len(documents)
    )


@router.get("/{cv_id}", response_model=CVDocumentRead)
async def get_cv(cv_id: uuid.UUID, db: DbSession, current_user: CurrentUser) -> CVDocumentRead:
    document = await CVService(db).get_owned(user=current_user, document_id=cv_id)
    return CVDocumentRead.model_validate(document)


@router.delete("/{cv_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cv(cv_id: uuid.UUID, db: DbSession, current_user: CurrentUser) -> None:
    await CVService(db).delete(user=current_user, document_id=cv_id)


@router.post("/{cv_id}/analyze", response_model=CVAnalysisRead, status_code=status.HTTP_201_CREATED)
async def analyze_cv(cv_id: uuid.UUID, db: DbSession, current_user: VerifiedUser) -> CVAnalysisRead:
    analysis = await CVAnalysisService(db).analyze(user=current_user, document_id=cv_id)
    return CVAnalysisRead.model_validate(analysis)


@router.get("/{cv_id}/analysis", response_model=CVAnalysisRead)
async def get_cv_analysis(
    cv_id: uuid.UUID, db: DbSession, current_user: CurrentUser
) -> CVAnalysisRead:
    analysis = await CVAnalysisService(db).get_latest(user=current_user, document_id=cv_id)
    return CVAnalysisRead.model_validate(analysis)
