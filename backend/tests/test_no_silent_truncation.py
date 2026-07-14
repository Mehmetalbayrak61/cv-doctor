"""K2: hiçbir AI akışı, CvTextService.extract() tarafından zaten onaylanmış CV metnini
kendi başına ikinci kez sessizce kesmemeli. Her prompt builder, 20.000+ karakterlik bir
CV metninin SONUNA kadar tamamını AI'ya iletmeli (eskiden job_prompts.py ve
rewrite_prompts.py bunu 15.000 karakterde sessizce kesiyordu).
"""

from app.ai.job_prompts import (
    build_interview_prep_prompt,
    build_job_match_messages,
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

LONG_CV = "PROFİL\n" + "Deneyim ve başarı. " * 2_000 + "\nSON_BÖLÜM_KORUNDU"


def test_long_cv_fixture_exceeds_old_15000_char_truncation_point() -> None:
    assert len(LONG_CV) > 20_000


def test_job_match_prompt_keeps_full_cv_text() -> None:
    messages = build_job_match_messages(
        cv_text=LONG_CV, job_title="Backend Developer", job_description="Python, FastAPI"
    )
    assert messages[-1]["content"].endswith("SON_BÖLÜM_KORUNDU")


def test_keyword_optimize_prompt_keeps_full_cv_text() -> None:
    _, user = build_keyword_optimize_prompt(LONG_CV, ["Kubernetes", "Docker"])
    assert user.endswith("SON_BÖLÜM_KORUNDU")


def test_interview_prep_prompt_keeps_full_cv_text() -> None:
    _, user = build_interview_prep_prompt(
        LONG_CV, job_title="Backend Developer", job_description="Python, FastAPI"
    )
    assert user.endswith("SON_BÖLÜM_KORUNDU")


def test_salary_estimation_prompt_keeps_full_cv_text() -> None:
    _, user = build_salary_estimation_prompt(
        LONG_CV, job_title="Backend Developer", country="Türkiye", city="İstanbul"
    )
    assert user.endswith("SON_BÖLÜM_KORUNDU")


def test_summary_rewrite_prompt_keeps_full_cv_text() -> None:
    _, user = build_summary_rewrite_prompt(LONG_CV)
    assert user.endswith("SON_BÖLÜM_KORUNDU")


def test_experience_rewrite_prompt_keeps_full_cv_text() -> None:
    _, user = build_experience_rewrite_prompt(LONG_CV)
    assert user.endswith("SON_BÖLÜM_KORUNDU")


def test_skills_rewrite_prompt_keeps_full_cv_text() -> None:
    _, user = build_skills_rewrite_prompt(LONG_CV)
    assert user.endswith("SON_BÖLÜM_KORUNDU")


def test_ats_optimize_prompt_keeps_full_cv_text() -> None:
    _, user = build_ats_optimize_prompt(LONG_CV, "Backend Developer")
    assert user.endswith("SON_BÖLÜM_KORUNDU")


def test_cover_letter_prompt_keeps_full_cv_text() -> None:
    _, user = build_cover_letter_prompt(
        LONG_CV, job_title="Backend Developer", company_name="Acme", job_description=None
    )
    assert user.endswith("SON_BÖLÜM_KORUNDU")


def test_linkedin_summary_prompt_keeps_full_cv_text() -> None:
    _, user = build_linkedin_summary_prompt(LONG_CV)
    assert user.endswith("SON_BÖLÜM_KORUNDU")
