"""Faz 5 AI Rewrite araçları için prompt şablonları.

Analiz prompt'unun aksine (app/ai/prompts.py) bu çıktılar serbest metindir —
JSON şeması gerektirmez, kullanıcıya doğrudan kopyalanabilir/indirilebilir metin olarak sunulur.
"""

from app.ai.prompts import MAX_CV_TEXT_CHARS

BASE_REWRITE_SYSTEM_PROMPT = (
    "Sen kıdemli bir kariyer danışmanı ve profesyonel metin yazarısın. "
    "Yanıtların doğrudan kullanılabilir olmalı; açıklama, giriş cümlesi veya "
    "markdown kod bloğu ekleme, sadece istenen çıktıyı yaz. Türkçe yaz."
)


def _truncate(cv_text: str) -> str:
    return cv_text[:MAX_CV_TEXT_CHARS]


def build_summary_rewrite_prompt(cv_text: str) -> tuple[str, str]:
    system = BASE_REWRITE_SYSTEM_PROMPT
    user = (
        "Aşağıdaki özgeçmişin profil özeti / kariyer hedefi bölümünü daha güçlü, "
        "somut ve etkileyici şekilde yeniden yaz. 3-5 cümle, ölçülebilir başarılara "
        "ve öne çıkan yetkinliklere yer ver.\n\nÖzgeçmiş:\n" + _truncate(cv_text)
    )
    return system, user


def build_experience_rewrite_prompt(cv_text: str) -> tuple[str, str]:
    system = BASE_REWRITE_SYSTEM_PROMPT
    user = (
        "Aşağıdaki özgeçmişteki iş deneyimi maddelerini güçlü eylem fiilleriyle başlayan, "
        "mümkün olduğunca sayısal/ölçülebilir sonuçlar içeren maddeler halinde yeniden yaz. "
        "Her madde bir satırda '- ' ile başlasın.\n\nÖzgeçmiş:\n" + _truncate(cv_text)
    )
    return system, user


def build_skills_rewrite_prompt(cv_text: str) -> tuple[str, str]:
    system = BASE_REWRITE_SYSTEM_PROMPT
    user = (
        "Aşağıdaki özgeçmişteki yetenekleri/becerileri incele; eksik ama sektörde aranan "
        "anahtar kelimeleri ekleyerek, teknik ve kişisel beceriler olarak iki grupta, "
        "her biri '- ' ile başlayan bir liste halinde düzenle.\n\nÖzgeçmiş:\n"
        + _truncate(cv_text)
    )
    return system, user


def build_ats_optimize_prompt(cv_text: str, target_job_title: str | None) -> tuple[str, str]:
    system = BASE_REWRITE_SYSTEM_PROMPT
    target_line = f"Hedeflenen pozisyon: {target_job_title}\n" if target_job_title else ""
    user = (
        f"{target_line}Aşağıdaki özgeçmişi ATS (Aday Takip Sistemi) uyumluluğu için "
        "optimize edilmiş şekilde yeniden düzenle: net bölüm başlıkları, standart tarih "
        "formatları, anahtar kelime yoğunluğu ve sade biçimlendirme kullan. Sonucu "
        "doğrudan bir CV taslağı olarak, bölüm başlıklarıyla (ör. ÖZET, DENEYİM, EĞİTİM, "
        "YETENEKLER) yaz.\n\nÖzgeçmiş:\n" + _truncate(cv_text)
    )
    return system, user


def build_cover_letter_prompt(
    cv_text: str,
    *,
    job_title: str,
    company_name: str | None,
    job_description: str | None,
) -> tuple[str, str]:
    system = BASE_REWRITE_SYSTEM_PROMPT
    company_line = f"Şirket: {company_name}\n" if company_name else ""
    job_desc_line = f"İlan detayı:\n{job_description}\n\n" if job_description else ""
    user = (
        f"Hedef pozisyon: {job_title}\n{company_line}{job_desc_line}"
        "Aşağıdaki özgeçmişe dayanarak bu pozisyon için profesyonel, samimi ve "
        "kişiselleştirilmiş bir ön yazı (cover letter) yaz. 3-4 paragraf olsun.\n\n"
        "Özgeçmiş:\n" + _truncate(cv_text)
    )
    return system, user


def build_linkedin_summary_prompt(cv_text: str) -> tuple[str, str]:
    system = BASE_REWRITE_SYSTEM_PROMPT
    user = (
        "Aşağıdaki özgeçmişe dayanarak LinkedIn 'Hakkında' bölümü için ilgi çekici, "
        "birinci ağızdan yazılmış, anahtar kelime açısından zengin bir özet yaz "
        "(yaklaşık 150-250 kelime).\n\nÖzgeçmiş:\n" + _truncate(cv_text)
    )
    return system, user
