"""Faz 6 Job Matching için prompt şablonları (job match JSON + job-scoped rewrite araçları).

CV metni burada kesilmez: CvTextService.extract() bu metni AI servislerine ulaşmadan önce
settings.MAX_CV_TEXT_CHARS ile zaten doğrulamış/reddetmiştir (bkz. cv_text_service.py).
"""

from app.ai.rewrite_prompts import BASE_REWRITE_SYSTEM_PROMPT

# İlan metinleri CV'den daha kısa tutulur (maliyet/güvenlik).
MAX_JOB_TEXT_CHARS = 8000

JOB_MATCH_SYSTEM_PROMPT = """Sen kıdemli bir işe alım (recruiting) uzmanı ve kariyer danışmanısın. \
Sana bir özgeçmiş ve bir iş ilanı verilecek; ikisini karşılaştırıp SADECE geçerli bir JSON nesnesi \
döndüreceksin. JSON dışında hiçbir açıklama, markdown işareti (```) veya ek metin yazma.

Yanıtın tam olarak şu alanları içermeli:
{
  "compatibility_score": 0-100 arası tam sayı (genel uyumluluk),
  "ats_match_score": 0-100 arası tam sayı (ATS/anahtar kelime eşleşmesi),
  "matched_skills": ["ilanla eşleşen beceri", "..."],
  "missing_skills": ["ilanda istenen ama CV'de olmayan beceri", "..."],
  "strengths": ["adayın bu ilan için güçlü yönü", "..."],
  "weaknesses": ["adayın bu ilan için zayıf yönü", "..."],
  "recommendations": ["başvuruyu güçlendirmek için öneri", "..."],
  "missing_keywords": ["ATS için eklenmesi gereken anahtar kelime", "..."],
  "hiring_probability": 0-100 arası tam sayı (işe alınma olasılığı tahmini),
  "seniority_fit": "adayın seviyesinin ilana uygunluğu hakkında kısa değerlendirme
    (ör. 'Mid seviye için uygun, Senior için erken')",
  "skill_gap": [
    {"skill": "eksik teknoloji/beceri", "priority": "low|medium|high",
     "estimated_learning_time": "ör. '2 hafta'"},
    "..."
  ]
}

priority alanı sadece "low", "medium" veya "high" değerlerinden biri olmalı. Tüm metinleri Türkçe \
yaz. Liste alanları boş kalabilir ama her zaman bir liste olmalı."""


def build_job_match_messages(
    *, cv_text: str, job_title: str, job_description: str
) -> list[dict[str, str]]:
    truncated_job = job_description[:MAX_JOB_TEXT_CHARS]
    user_content = (
        f"İlan başlığı: {job_title}\n\nİlan açıklaması:\n{truncated_job}\n\n"
        f"Aday özgeçmişi:\n{cv_text}"
    )
    return [
        {"role": "system", "content": JOB_MATCH_SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]


def build_keyword_optimize_prompt(cv_text: str, missing_keywords: list[str]) -> tuple[str, str]:
    system = BASE_REWRITE_SYSTEM_PROMPT
    keywords = ", ".join(missing_keywords)
    user = (
        f"Aşağıdaki özgeçmişi, şu eksik ATS anahtar kelimelerini ilgili bölümlere "
        f"(deneyim, yetenekler, özet) doğal ve inandırıcı bir şekilde yerleştirerek yeniden yaz. "
        f"Uydurma başarı/deneyim ekleme; sadece mevcut içeriği bu kelimelerle zenginleştir.\n\n"
        f"Eksik anahtar kelimeler: {keywords}\n\nÖzgeçmiş:\n{cv_text}"
    )
    return system, user


def build_interview_prep_prompt(
    cv_text: str, *, job_title: str, job_description: str
) -> tuple[str, str]:
    system = BASE_REWRITE_SYSTEM_PROMPT
    user = (
        f"Aşağıdaki iş ilanı ve adayın özgeçmişine dayanarak mülakat hazırlığı için sorular üret.\n"
        f"Çıktı tam olarak şu formatta olsun:\n\n"
        f"TEKNİK SORULAR:\n1. ...\n...\n10. ...\n\nİK SORULARI:\n1. ...\n...\n10. ...\n\n"
        f"İlan başlığı: {job_title}\nİlan açıklaması:\n{job_description[:MAX_JOB_TEXT_CHARS]}\n\n"
        f"Aday özgeçmişi:\n{cv_text}"
    )
    return system, user


def build_salary_estimation_prompt(
    cv_text: str,
    *,
    job_title: str,
    country: str | None,
    city: str | None,
) -> tuple[str, str]:
    system = BASE_REWRITE_SYSTEM_PROMPT
    location_line = ", ".join(part for part in [city, country] if part) or "belirtilmedi"
    user = (
        f"Aşağıdaki özgeçmiş ve pozisyon bilgisine göre gerçekçi bir maaş aralığı tahmini yap. "
        f"Yerel para birimini kullan, tahminin kaba bir aralık olduğunu belirt ve tahmine "
        f"etki eden 2-3 faktörü kısaca açıkla.\n\n"
        f"Pozisyon: {job_title}\nKonum: {location_line}\n\nÖzgeçmiş:\n{cv_text}"
    )
    return system, user
