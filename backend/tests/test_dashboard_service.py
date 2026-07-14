"""DashboardService.overview() için servis-seviyeli senaryolar.

Denetim raporunun bulduğu gerçek hata: latest_cv_id (en son YÜKLENEN belge) ile
overall_score/ats_score (eskiden en son ANALİZ EDİLEN belge) farklı CV'lere ait
olabiliyordu. Bu dosya hem o düzeltmeyi hem de önceden hiç test edilmemiş üç
temel durumu (sıfır CV, analizsiz CV, iki CV'den yalnızca biri analizli) kapsar.
"""

import uuid
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

from app.models.cv_analysis import AnalysisStatus
from app.services.dashboard_service import DashboardService


def _make_service(*, documents, completed_analyses) -> DashboardService:
    service = DashboardService.__new__(DashboardService)
    service._documents = SimpleNamespace(list_by_user=AsyncMock(return_value=documents))
    service._analyses = SimpleNamespace(
        list_completed_by_user=AsyncMock(return_value=completed_analyses)
    )
    service._outputs = SimpleNamespace(
        list_recent_by_user=AsyncMock(return_value=[]),
        count_recent_by_user=AsyncMock(return_value=0),
    )
    service._matches = SimpleNamespace(count_by_user=AsyncMock(return_value=0))
    return service


def _document(doc_id: uuid.UUID, *, created_at: datetime) -> SimpleNamespace:
    return SimpleNamespace(
        id=doc_id,
        created_at=created_at,
        file_name="cv.pdf",
        file_size=12_345,
        mime_type="application/pdf",
    )


def _analysis(
    doc_id: uuid.UUID, *, created_at: datetime, overall: int, ats: int
) -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        cv_document_id=doc_id,
        version=1,
        status=AnalysisStatus.COMPLETED,
        error_message=None,
        created_at=created_at,
        result={
            "overall_score": overall,
            "ats_score": ats,
            "summary": "Test özeti.",
            "strengths": ["Güçlü yön"],
            "weaknesses": ["Zayıf yön"],
            "missing_keywords": [],
            "improvement_suggestions": ["Öneri"],
            "corrected_profile_summary": "Özet.",
            "suggested_job_titles": ["Yazılım Geliştirici"],
            "language_quality": {"score": 80, "comment": "İyi."},
            "section_quality": {"score": 80, "comment": "İyi."},
            "experience_quality": {"score": 80, "comment": "İyi."},
            "education_quality": {"score": 80, "comment": "İyi."},
            "skills_quality": {"score": 80, "comment": "İyi."},
        },
    )


async def test_zero_cv_user_gets_empty_overview() -> None:
    service = _make_service(documents=[], completed_analyses=[])
    user = SimpleNamespace(id=uuid.uuid4())

    overview = await service.overview(user=user)

    assert overview.has_any_cv is False
    assert overview.total_cvs == 0
    assert overview.latest_cv_id is None
    assert overview.overall_score is None
    assert overview.ats_score is None
    assert overview.recent_analyses == []


async def test_cv_uploaded_but_not_yet_analyzed_has_no_score() -> None:
    doc_id = uuid.uuid4()
    document = _document(doc_id, created_at=datetime(2026, 1, 1, tzinfo=UTC))
    service = _make_service(documents=[document], completed_analyses=[])
    user = SimpleNamespace(id=uuid.uuid4())

    overview = await service.overview(user=user)

    assert overview.has_any_cv is True
    assert overview.total_cvs == 1
    assert overview.latest_cv_id == doc_id
    assert overview.overall_score is None
    assert overview.ats_score is None


async def test_latest_score_belongs_to_the_same_cv_as_latest_cv_id() -> None:
    """Regresyon testi: eski CV'nin skoru, yeni yüklenen (henüz analiz edilmemiş)
    CV'nin id'sine yanlışlıkla iliştirilmemeli."""
    old_cv_id, new_cv_id = uuid.uuid4(), uuid.uuid4()
    old_cv = _document(old_cv_id, created_at=datetime(2026, 1, 1, tzinfo=UTC))
    new_cv = _document(new_cv_id, created_at=datetime(2026, 1, 5, tzinfo=UTC))
    old_analysis = _analysis(
        old_cv_id, created_at=datetime(2026, 1, 1, tzinfo=UTC), overall=90, ats=85
    )
    # documents newest-first (repository'nin gerçek sıralamasıyla aynı)
    service = _make_service(documents=[new_cv, old_cv], completed_analyses=[old_analysis])
    user = SimpleNamespace(id=uuid.uuid4())

    overview = await service.overview(user=user)

    assert overview.latest_cv_id == new_cv_id
    # new_cv henüz analiz edilmedi -> old_cv'nin skoru burada GÖRÜNMEMELİ
    assert overview.overall_score is None
    assert overview.ats_score is None


async def test_two_cvs_only_the_analyzed_latest_one_shows_its_own_score() -> None:
    old_cv_id, new_cv_id = uuid.uuid4(), uuid.uuid4()
    old_cv = _document(old_cv_id, created_at=datetime(2026, 1, 1, tzinfo=UTC))
    new_cv = _document(new_cv_id, created_at=datetime(2026, 1, 5, tzinfo=UTC))
    old_analysis = _analysis(
        old_cv_id, created_at=datetime(2026, 1, 1, tzinfo=UTC), overall=60, ats=55
    )
    new_analysis = _analysis(
        new_cv_id, created_at=datetime(2026, 1, 6, tzinfo=UTC), overall=90, ats=88
    )
    service = _make_service(
        documents=[new_cv, old_cv], completed_analyses=[new_analysis, old_analysis]
    )
    user = SimpleNamespace(id=uuid.uuid4())

    overview = await service.overview(user=user)

    assert overview.latest_cv_id == new_cv_id
    assert overview.overall_score == 90
    assert overview.ats_score == 88
