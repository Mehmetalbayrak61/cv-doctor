from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DbSession
from app.schemas.dashboard import DashboardOverviewRead
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardOverviewRead)
async def get_dashboard_overview(db: DbSession, current_user: CurrentUser) -> DashboardOverviewRead:
    return await DashboardService(db).overview(user=current_user)
