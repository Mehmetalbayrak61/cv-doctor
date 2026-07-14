import io
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from starlette.datastructures import Headers, UploadFile

from app.ai.base import AIProviderError
from app.core.exceptions import AIAnalysisError
from app.models.cv_analysis import AnalysisStatus
from app.schemas.job_match import JobMatchResult
from app.services.cv_analysis_service import CVAnalysisService
from app.services.cv_service import CVService
from app.services.job_match_service import JobMatchService
from tests.test_cv_scoring import CV_TEXT, _base_result


async def test_upload_flow_validates_saves_and_commits() -> None:
    service = CVService.__new__(CVService)
    service._db = SimpleNamespace(commit=AsyncMock())
    service._storage = SimpleNamespace(save=AsyncMock(return_value="cvs/test.pdf"))
    stored_document = SimpleNamespace(id=uuid.uuid4())
    service._repo = SimpleNamespace(create=AsyncMock(return_value=stored_document))
    upload = UploadFile(
        file=io.BytesIO(b"%PDF-1.7 valid"),
        filename="cv.pdf",
        headers=Headers({"content-type": "application/pdf"}),
    )
    user = SimpleNamespace(id=uuid.uuid4())

    assert await service.upload(user=user, file=upload) is stored_document
    service._storage.save.assert_awaited_once()
    service._repo.create.assert_awaited_once()
    service._db.commit.assert_awaited_once()


async def test_analysis_flow_applies_versioned_scoring(monkeypatch) -> None:
    document = SimpleNamespace(id=uuid.uuid4())
    user = SimpleNamespace(id=uuid.uuid4(), is_admin=False)
    created_analysis = SimpleNamespace(id=uuid.uuid4())
    repository = SimpleNamespace(
        get_next_version=AsyncMock(return_value=2),
        create=AsyncMock(return_value=created_analysis),
    )
    service = CVAnalysisService.__new__(CVAnalysisService)
    service._db = SimpleNamespace(commit=AsyncMock())
    service._cv_service = SimpleNamespace(get_owned=AsyncMock(return_value=document))
    service._repo = repository
    service._usage_repo = SimpleNamespace()
    service._text_service = SimpleNamespace(extract=AsyncMock(return_value=CV_TEXT))
    service._provider = SimpleNamespace(analyze=AsyncMock(return_value=(_base_result(), None)))
    rate_limit_mock = AsyncMock()
    usage_mock = AsyncMock()
    monkeypatch.setattr("app.services.cv_analysis_service.enforce_ai_rate_limit", rate_limit_mock)
    monkeypatch.setattr("app.services.cv_analysis_service.record_ai_usage", usage_mock)

    assert await service.analyze(user=user, document_id=document.id) is created_analysis
    payload = repository.create.await_args.kwargs
    assert payload["version"] == 2
    assert payload["status"] == AnalysisStatus.COMPLETED
    assert payload["result"]["scoring_method"] == "cv-readiness-v1"
    assert payload["result"]["missing_keywords"] == []
    # Denetim raporu bulgusu: bu iki çağrı önceden hiç doğrulanmıyordu — servis
    # metodundan silinseler bile test yeşil kalırdı.
    rate_limit_mock.assert_awaited_once()
    usage_mock.assert_awaited_once()


async def test_analysis_flow_records_failed_status_on_ai_provider_error(monkeypatch) -> None:
    """Denetim raporu bulgusu: happy-path dışında hiçbir test yoktu — provider
    hatası fırlattığında FAILED kaydının gerçekten yazıldığı ve AIAnalysisError'ın
    fırlatıldığı hiç doğrulanmıyordu."""
    document = SimpleNamespace(id=uuid.uuid4())
    user = SimpleNamespace(id=uuid.uuid4(), is_admin=False)
    repository = SimpleNamespace(
        get_next_version=AsyncMock(return_value=1),
        create=AsyncMock(return_value=SimpleNamespace(id=uuid.uuid4())),
    )
    service = CVAnalysisService.__new__(CVAnalysisService)
    service._db = SimpleNamespace(commit=AsyncMock())
    service._cv_service = SimpleNamespace(get_owned=AsyncMock(return_value=document))
    service._repo = repository
    service._usage_repo = SimpleNamespace()
    service._text_service = SimpleNamespace(extract=AsyncMock(return_value=CV_TEXT))
    service._provider = SimpleNamespace(
        analyze=AsyncMock(side_effect=AIProviderError("sağlayıcı zaman aşımına uğradı"))
    )
    monkeypatch.setattr("app.services.cv_analysis_service.enforce_ai_rate_limit", AsyncMock())
    monkeypatch.setattr("app.services.cv_analysis_service.record_ai_usage", AsyncMock())

    with pytest.raises(AIAnalysisError):
        await service.analyze(user=user, document_id=document.id)

    payload = repository.create.await_args.kwargs
    assert payload["status"] == AnalysisStatus.FAILED
    assert payload["result"] is None
    assert "zaman aşımına uğradı" in payload["error_message"]
    service._db.commit.assert_awaited_once()


async def test_job_match_flow_validates_and_persists(monkeypatch) -> None:
    user = SimpleNamespace(id=uuid.uuid4(), is_admin=False)
    job = SimpleNamespace(id=uuid.uuid4(), title="Backend Developer", description="Python")
    document = SimpleNamespace(id=uuid.uuid4())
    result = JobMatchResult.model_validate(
        {
            "compatibility_score": 70,
            "ats_match_score": 68,
            "matched_skills": ["Python"],
            "missing_skills": ["Docker"],
            "strengths": ["Python deneyimi"],
            "weaknesses": ["Docker eksik"],
            "recommendations": ["Docker deneyimini açıklayın"],
            "missing_keywords": ["Docker"],
            "hiring_probability": 50,
            "seniority_fit": "Uygun",
            "skill_gap": [],
        }
    )
    created_match = SimpleNamespace(id=uuid.uuid4())
    repository = SimpleNamespace(create=AsyncMock(return_value=created_match))
    service = JobMatchService.__new__(JobMatchService)
    service._db = SimpleNamespace(commit=AsyncMock())
    service._job_service = SimpleNamespace(get_owned=AsyncMock(return_value=job))
    service._cv_service = SimpleNamespace(get_owned=AsyncMock(return_value=document))
    service._text_service = SimpleNamespace(extract=AsyncMock(return_value=CV_TEXT))
    service._repo = repository
    service._usage_repo = SimpleNamespace()
    service._provider = SimpleNamespace(match_job=AsyncMock(return_value=(result, None)))
    rate_limit_mock = AsyncMock()
    usage_mock = AsyncMock()
    monkeypatch.setattr("app.services.job_match_service.enforce_ai_rate_limit", rate_limit_mock)
    monkeypatch.setattr("app.services.job_match_service.record_ai_usage", usage_mock)

    assert await service.match(user=user, job_id=job.id, cv_id=document.id) is created_match
    payload = repository.create.await_args.kwargs
    assert payload["status"] == AnalysisStatus.COMPLETED
    assert payload["result"]["ats_match_score"] == 68
    rate_limit_mock.assert_awaited_once()
    usage_mock.assert_awaited_once()
