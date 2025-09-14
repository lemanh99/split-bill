from fastapi import Depends
from fastapi.security import (
    HTTPBearer,
    HTTPBasicCredentials,
)

from app.auth.services.auth_service import AuthService
from core.common.database import get_async_db_session

jwt_security = HTTPBearer()


async def auth_verify(
    db_session=Depends(get_async_db_session),
    credentials: HTTPBasicCredentials = Depends(jwt_security),
):
    access_token = credentials.credentials
    auth_service = AuthService(db_session)
    auth_res = await auth_service.get_current_user(access_token)
    return auth_res
