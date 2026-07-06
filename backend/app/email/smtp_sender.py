from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings
from app.email.base import EmailSender, EmailSendError


class SmtpEmailSender(EmailSender):
    """Herhangi bir SMTP sağlayıcısıyla (Gmail, SES, SendGrid, Postmark, Resend-SMTP, ...)
    çalışan provider-agnostic e-posta gönderici."""

    async def send(self, *, to: str, subject: str, html_body: str, text_body: str) -> None:
        # Lazy import: aiosmtplib sadece bu sağlayıcı gerçekten kullanıldığında yüklenir.
        import aiosmtplib

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
        message["To"] = to
        message.attach(MIMEText(text_body, "plain", "utf-8"))
        message.attach(MIMEText(html_body, "html", "utf-8"))

        try:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USERNAME or None,
                password=settings.SMTP_PASSWORD or None,
                start_tls=settings.SMTP_USE_TLS,
            )
        except Exception as exc:
            raise EmailSendError(f"E-posta gönderilemedi: {exc}") from exc
