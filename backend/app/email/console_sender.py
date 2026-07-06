"""SMTP_HOST tanımlı değilken kullanılan, gerçek e-posta göndermeyen sağlayıcı.

Faz 3'teki MockAIProvider ile aynı amaç: local geliştirmede gerçek SMTP kimlik
bilgisi olmadan e-posta doğrulama/şifre sıfırlama akışlarının uçtan uca test
edilebilmesini sağlar. E-posta içeriği (doğrulama linki dahil) log'a yazılır.
"""

import logging

from app.email.base import EmailSender

logger = logging.getLogger("app.email.console")
logger.setLevel(logging.INFO)
if not logger.handlers:
    # Uygulamanın genel logging seviyesi (varsayılan: WARNING) bu mesajları
    # boğmasın diye kendi handler'ımızı ekliyoruz — bu sağlayıcı zaten sadece
    # dev'de "e-postayı konsola yaz" amacıyla var, görünmezse işe yaramaz.
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(_handler)
    logger.propagate = False


class ConsoleEmailSender(EmailSender):
    async def send(self, *, to: str, subject: str, html_body: str, text_body: str) -> None:
        logger.info(
            "=== [DEV] E-posta gönderilecekti (SMTP_HOST tanımlı değil) ===\n"
            "Kime: %s\nKonu: %s\n---\n%s\n===",
            to,
            subject,
            text_body,
        )
