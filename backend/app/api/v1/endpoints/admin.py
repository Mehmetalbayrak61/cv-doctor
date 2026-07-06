from fastapi import APIRouter

from app.core.dependencies import AdminUser, DbSession
from app.schemas.admin import AdminMetrics
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/metrics", response_model=AdminMetrics)
async def get_metrics(db: DbSession, _admin: AdminUser) -> AdminMetrics:
    return await AdminService(db).get_metrics()
