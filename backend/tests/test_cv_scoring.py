from app.schemas.cv_analysis import CVAnalysisResult, QualityAssessment
from app.services.cv_scoring_service import SCORING_METHOD, apply_scoring_rubric


def _base_result() -> CVAnalysisResult:
    return CVAnalysisResult(
        overall_score=1,
        ats_score=1,
        summary="Açık ve profesyonel bir CV.",
        strengths=["Net deneyim akışı"],
        weaknesses=["Daha fazla ölçülebilir sonuç eklenebilir"],
        missing_keywords=["uydurulmamalı"],
        improvement_suggestions=["Başarıları sayısallaştırın"],
        corrected_profile_summary="Deneyimli yazılım geliştirici.",
        suggested_job_titles=["Yazılım Geliştirici"],
        language_quality=QualityAssessment(score=80, comment="Dil açık."),
        section_quality=QualityAssessment(score=75, comment="Bölümler düzenli."),
        experience_quality=QualityAssessment(score=70, comment="Deneyim anlaşılır."),
        education_quality=QualityAssessment(score=85, comment="Eğitim net."),
        skills_quality=QualityAssessment(score=78, comment="Yetenekler ilgili."),
    )


CV_TEXT = """Ayşe Yılmaz
ayse@example.com | +90 555 111 22 33 | linkedin.com/in/ayse

PROFİL ÖZETİ
Yazılım geliştirme alanında deneyimli mühendis.

İŞ DENEYİMİ
2021 - 2024 Yazılım Geliştirici
- İşlem süresini %35 azalttı.
- 12 kişilik ekiple 4 proje tamamladı.

EĞİTİM
2016 - 2020 Bilgisayar Mühendisliği

YETENEKLER
Python, React, PostgreSQL, Docker
"""


def test_scoring_is_deterministic_and_versioned() -> None:
    first = apply_scoring_rubric(CV_TEXT, _base_result())
    second = apply_scoring_rubric(CV_TEXT, _base_result())

    assert first.ats_score == second.ats_score
    assert first.overall_score == second.overall_score == 76
    assert first.scoring_method == SCORING_METHOD
    assert sum(item.weight for item in first.ats_breakdown) == 100
    assert sum(item.weight for item in first.overall_breakdown) == 100


def test_ats_score_matches_known_correct_value_not_just_determinism() -> None:
    """Determinizm tek başına yeterli değil: bir fonksiyon her zaman aynı YANLIŞ
    sonucu da tutarlı biçimde üretebilir (bkz. Türkçe İ/casefold hatası — bölüm
    başlıkları hiç tespit edilemediği için ats_score 55 dönüyordu, hâlbuki tüm
    bölümler CV_TEXT'te açıkça mevcut). Bu test, tüm 4 bölümün (profil/deneyim/
    eğitim/yetenek) doğru tespit edildiği, bilinen-doğru bir skora karşı denetler."""
    result = apply_scoring_rubric(CV_TEXT, _base_result())

    assert result.ats_score == 87

    structure = next(item for item in result.ats_breakdown if item.key == "structure")
    assert structure.score == 100, "PROFİL/DENEYİM/EĞİTİM/YETENEKLER dört bölüm de tespit edilmeli"

    skills = next(item for item in result.ats_breakdown if item.key == "skills")
    assert skills.score == 100, "YETENEKLER bölümü + virgüllü liste tam puan almalı"


def test_general_analysis_never_returns_job_specific_keywords() -> None:
    result = apply_scoring_rubric(CV_TEXT, _base_result())
    assert result.missing_keywords == []


def test_weak_cv_scores_lower_than_complete_cv() -> None:
    complete = apply_scoring_rubric(CV_TEXT, _base_result())
    weak = apply_scoring_rubric("Ayşe\nKısa özgeçmiş", _base_result())
    assert weak.ats_score < complete.ats_score
    assert any(item.findings for item in weak.ats_breakdown)
