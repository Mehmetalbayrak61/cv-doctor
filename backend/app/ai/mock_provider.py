"""OPENAI_API_KEY tanımlı değilken kullanılan, gerçek API çağrısı yapmayan sağlayıcı.

Faz 3 akışının (extract -> analyze -> kaydet) API anahtarı olmadan da uçtan uca
test edilebilmesini sağlar.
"""

from app.ai.base import AIUsage, CVAnalysisProvider
from app.schemas.cv_analysis import CVAnalysisResult, QualityAssessment
from app.schemas.job_match import JobMatchResult, SkillGapItem


class MockAIProvider(CVAnalysisProvider):
    async def analyze(self, cv_text: str) -> tuple[CVAnalysisResult, AIUsage | None]:
        preview = " ".join(cv_text.split())[:200]
        result = CVAnalysisResult(
            overall_score=70,
            ats_score=65,
            summary="Bu bir mock analiz sonucudur (OPENAI_API_KEY tanımlı değil).",
            strengths=["Net iletişim", "Düzenli iş deneyimi akışı"],
            weaknesses=["Ölçülebilir başarılar eksik"],
            missing_keywords=["proje yönetimi", "liderlik"],
            improvement_suggestions=["Başarılarını sayısal verilerle destekle."],
            corrected_profile_summary=preview or "İçerik özeti oluşturulamadı.",
            suggested_job_titles=["Yazılım Geliştirici"],
            language_quality=QualityAssessment(score=70, comment="Dil akıcı ama geliştirilebilir."),
            section_quality=QualityAssessment(score=70, comment="Bölümler standart sırada."),
            experience_quality=QualityAssessment(
                score=65, comment="Deneyimler yeterince detaylandırılmamış."
            ),
            education_quality=QualityAssessment(score=75, comment="Eğitim bilgisi net."),
            skills_quality=QualityAssessment(
                score=68, comment="Teknik beceriler daha fazla vurgulanabilir."
            ),
        )
        return result, None

    async def generate_text(
        self, *, system_prompt: str, user_prompt: str
    ) -> tuple[str, AIUsage | None]:
        preview = " ".join(user_prompt.split())[:160]
        content = (
            "Bu bir mock AI çıktısıdır (OPENAI_API_KEY tanımlı değil).\n\n"
            f"Girdi önizlemesi: {preview}…"
        )
        return content, None

    async def match_job(
        self, *, cv_text: str, job_title: str, job_description: str
    ) -> tuple[JobMatchResult, AIUsage | None]:
        result = JobMatchResult(
            compatibility_score=62,
            ats_match_score=58,
            matched_skills=["Python", "React"],
            missing_skills=["Docker", "Kubernetes"],
            strengths=["İlgili teknoloji deneyimi", "Net iletişim"],
            weaknesses=["Konteynerizasyon deneyimi eksik"],
            recommendations=["Docker/Kubernetes projeleri ekleyin", "Bulut deneyimini vurgulayın"],
            missing_keywords=["Docker", "CI/CD", "Kubernetes"],
            hiring_probability=55,
            seniority_fit="Mid seviye için uygun (mock sonuç).",
            skill_gap=[
                SkillGapItem(skill="Docker", priority="medium", estimated_learning_time="2 hafta"),
                SkillGapItem(skill="Kubernetes", priority="high", estimated_learning_time="1 ay"),
            ],
        )
        return result, None
