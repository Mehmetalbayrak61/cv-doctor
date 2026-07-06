"""Uygulama genelinde standart hata sözleşmesi.

Tüm hatalar aynı JSON zarfıyla döner:
    {"error": {"code": "not_found", "message": "..."}}

Bu format hem web hem de ileride Flutter istemcisi tarafından tek tip
parse edilebilmesi için sabittir.
"""

from fastapi import status


class AppError(Exception):
    """Servis/repository katmanlarında fırlatılan, HTTP durumuna eşlenen taban hata."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    code: str = "bad_request"

    def __init__(self, message: str, *, code: str | None = None, status_code: int | None = None) -> None:
        self.message = message
        if code is not None:
            self.code = code
        if status_code is not None:
            self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    code = "conflict"


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "unauthorized"


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    code = "forbidden"


class UnprocessableEntityError(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
    code = "unprocessable_entity"


class PayloadTooLargeError(AppError):
    status_code = status.HTTP_413_CONTENT_TOO_LARGE
    code = "payload_too_large"


class AIAnalysisError(AppError):
    """AI sağlayıcısından geçerli bir analiz alınamadığında (istek hatası veya bozuk yanıt)."""

    status_code = status.HTTP_502_BAD_GATEWAY
    code = "ai_analysis_failed"


class RateLimitError(AppError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    code = "rate_limited"
