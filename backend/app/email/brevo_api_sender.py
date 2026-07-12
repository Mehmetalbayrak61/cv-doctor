import httpx

from app.core.config import settings
from app.email.base import EmailSender, EmailSendError

_BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email"
_TIMEOUT_SECONDS = 10.0


class BrevoApiEmailSender(EmailSender):
    """Brevo'nun transactional e-posta REST API'si üzerinden gönderir (HTTPS, port 443).

    Railway'in giden SMTP portlarını (25/465/587/2525) ağ seviyesinde engellemesi
    nedeniyle SmtpEmailSender yerine tercih edilir — aynı EmailSender arayüzünü
    uygular, servis katmanında hiçbir değişiklik gerektirmez.
    """

    async def send(self, *, to: str, subject: str, html_body: str, text_body: str) -> None:
        payload = {
            "sender": {"name": settings.EMAIL_FROM_NAME, "email": settings.EMAIL_FROM_ADDRESS},
            "to": [{"email": to}],
            "subject": subject,
            "htmlContent": html_body,
            "textContent": text_body,
        }
        headers = {
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
                response = await client.post(_BREVO_ENDPOINT, json=payload, headers=headers)
        except httpx.TimeoutException as exc:
            raise EmailSendError("E-posta sağlayıcısına bağlanılamadı (zaman aşımı).") from exc
        except httpx.HTTPError as exc:
            raise EmailSendError("E-posta sağlayıcısına bağlanılamadı.") from exc

        if response.status_code in (401, 403):
            raise EmailSendError("E-posta sağlayıcısı kimlik doğrulamasını reddetti.")
        if response.status_code == 429:
            raise EmailSendError("E-posta sağlayıcısı istek limitine takıldı.")
        if response.status_code >= 500:
            raise EmailSendError("E-posta sağlayıcısı geçici olarak kullanılamıyor.")
        if response.status_code >= 400:
            raise EmailSendError("E-posta gönderilemedi.")
