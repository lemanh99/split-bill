from fastapi import APIRouter

from .auth import router as auth_router

routers = APIRouter(redirect_slashes=False)
routers.include_router(auth_router, prefix="/auth", tags=["auth"])
