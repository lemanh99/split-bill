from fastapi import APIRouter

from .auth import router as auth_router
from .bill import router as bill_router
from .file import router as file_router

routers = APIRouter(redirect_slashes=False)
routers.include_router(auth_router, tags=["auth"])
routers.include_router(file_router, tags=["file"])
routers.include_router(bill_router, tags=["bill"])
