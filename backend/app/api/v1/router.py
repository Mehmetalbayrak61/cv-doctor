"""v1 API router. Faz 3+'te her yeni endpoint modülü burada include edilecek."""

from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, cvs, dashboard, jobs, rewrites

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(cvs.router)
api_router.include_router(dashboard.router)
api_router.include_router(rewrites.router)
api_router.include_router(jobs.router)
api_router.include_router(admin.router)
