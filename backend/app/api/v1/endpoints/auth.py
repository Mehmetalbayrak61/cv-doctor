from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.dependencies import CurrentUser, DbSession
from app.core.rate_limit_ip import enforce_auth_rate_limit
from app.core.security import create_access_token
from app.schemas.user import (
    AccountDeleteRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserRead,
    VerifyEmailRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

# Rate limit sadece kimlik doğrulama/kurtarma amaçlı, maliyetli veya kaba-kuvvet
# riski taşıyan yazma uçlarına uygulanır. /me buna dahil değil: her sayfa
# yüklemesinde AuthProvider tarafından otomatik çağrılır, router genelinde limite
# dahil edilseydi normal kullanımda (birden fazla sekme/yenileme) kullanıcılar
# kendi oturumlarından "rate limited" hatasıyla düşerdi.
_rate_limited = [Depends(enforce_auth_rate_limit)]


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=_rate_limited,
)
async def register(payload: UserCreate, db: DbSession) -> UserRead:
    user = await AuthService(db).register(
        email=payload.email,
        password=payload.password,
        first_name=payload.first_name,
        last_name=payload.last_name,
    )
    return UserRead.model_validate(user)


@router.post("/login", response_model=Token, dependencies=_rate_limited)
async def login(
    db: DbSession,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    # OAuth2PasswordRequestForm "username" alanını kullanır; burada e-posta olarak yorumlanır
    # (Swagger'ın yerleşik "Authorize" akışıyla doğrudan uyumlu olması için).
    user = await AuthService(db).authenticate(email=form_data.username, password=form_data.password)
    access_token = create_access_token(user.id)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserRead)
async def read_me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT, dependencies=_rate_limited)
async def delete_me(
    payload: AccountDeleteRequest, db: DbSession, current_user: CurrentUser
) -> None:
    await AuthService(db).delete_account(user=current_user, password=payload.password)


@router.post("/verify-email", response_model=UserRead, dependencies=_rate_limited)
async def verify_email(payload: VerifyEmailRequest, db: DbSession) -> UserRead:
    user = await AuthService(db).verify_email(raw_token=payload.token)
    return UserRead.model_validate(user)


@router.post(
    "/resend-verification", status_code=status.HTTP_204_NO_CONTENT, dependencies=_rate_limited
)
async def resend_verification(db: DbSession, current_user: CurrentUser) -> None:
    await AuthService(db).resend_verification(user=current_user)


@router.post(
    "/forgot-password", status_code=status.HTTP_204_NO_CONTENT, dependencies=_rate_limited
)
async def forgot_password(payload: ForgotPasswordRequest, db: DbSession) -> None:
    # Kullanıcı var mı yok mu fark etmeksizin her zaman 204 döner (enumeration önleme).
    await AuthService(db).request_password_reset(email=payload.email)


@router.post(
    "/reset-password", status_code=status.HTTP_204_NO_CONTENT, dependencies=_rate_limited
)
async def reset_password(payload: ResetPasswordRequest, db: DbSession) -> None:
    await AuthService(db).reset_password(raw_token=payload.token, new_password=payload.new_password)
