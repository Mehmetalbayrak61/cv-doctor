from functools import lru_cache

from app.core.config import settings
from app.email.base import EmailSender


@lru_cache
def get_email_sender() -> EmailSender:
    if settings.SMTP_HOST:
        from app.email.smtp_sender import SmtpEmailSender

        return SmtpEmailSender()

    from app.email.console_sender import ConsoleEmailSender

    return ConsoleEmailSender()
