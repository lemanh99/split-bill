from fastapi import APIRouter, Depends, Request

from app.auth.schemas.auth import AuthLoginSchema
from app.auth.services.auth_service import AuthService
from app.common.auth import auth_verify
from app.common.constants import SocialProvider
from app.common.response import make_success_response
from app.common.social import social_oauth
from core.common.database import get_async_db_session

router = APIRouter(
    prefix="/auth", tags=["auth"], responses={404: {"description": "Not found"}}
)


@router.post("/sign-in")
async def sign_in(
    user: AuthLoginSchema,
    db_session=Depends(get_async_db_session),
):
    auth_service = AuthService(db_session)
    result = await auth_service.sign_in(user.user_id, user.password)
    return make_success_response(result)


@router.get("/google-sign-in")
async def google_sign_in(request: Request, callback_url: str):
    result = await social_oauth.google.authorize_redirect(request, callback_url)

    return make_success_response({"auth_url_path": result.headers.get("location")})


@router.get("/google-sign-in/token")
async def google_auth_token(
    request: Request,
    db_session=Depends(get_async_db_session),
):
    service = AuthService(db_session)
    result = await service.oauth_sign_in(SocialProvider.GOOGLE, request)

    return result


@router.post("/sign-out")
async def sign_out(
    current_user=Depends(auth_verify),
    db_session=Depends(get_async_db_session),
):
    auth_service = AuthService(db_session)
    result = await auth_service.sign_out(current_user["user_id"])
    return make_success_response(result)


@router.get("/me")
async def auth_me(current_user=Depends(auth_verify)):
    return make_success_response(current_user)


@router.get("/refresh-token")
async def refresh_token(
    refresh_token: str,
    db_session=Depends(get_async_db_session),
):
    auth_service = AuthService(db_session)
    return make_success_response(
        await auth_service.regenerate_access_token(refresh_token)
    )
