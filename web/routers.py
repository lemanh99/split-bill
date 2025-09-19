from fastapi import APIRouter

from web.home import home_routers
from web.other import other_routers

routers = APIRouter(redirect_slashes=False)
routers.include_router(other_routers)
routers.include_router(home_routers)
