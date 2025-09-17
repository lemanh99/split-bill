import datetime
import uuid

from fastapi_babel import _
from google.auth.exceptions import OAuthError
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy import select, delete

import config
from app.auth.models.auth_user import AuthToken, User, UserProfile
from app.auth.schemas.auth import AuthSignUpSchema
from app.common.constants import SocialProvider
from app.common.social import social_oauth
from config import JWT_ACCESS_SECRET_KEY, ALGORITHM
from core.common.auth import verify_password, create_token, get_hashed_password
from core.common.constants import TokenType
from core.common.exceptions import (
    BillFasterBadRequestException,
    BillFasterServiceException,
    BillFasterUnAuthenticatedException,
)
from core.services.base import BillFasterBaseService


class AuthService(BillFasterBaseService):
    async def auth_generate_token(self, user):
        refresh_token, refresh_token_expires_at = create_token(
            subject=user.user_id,
            token_type=TokenType.REFRESH_TOKEN,
        )

        access_token, __ = create_token(
            subject=user.user_id,
            token_type=TokenType.ACCESS_TOKEN,
        )

        try:
            delete_statement = delete(AuthToken).where(
                AuthToken.user_id == user.user_id
            )
            await self.db_session.execute(delete_statement)

            token_record = AuthToken(
                user_id=user.user_id,
                token=refresh_token,
                expires_at=refresh_token_expires_at,
            )
            self.db_session.add(token_record)
            await self.db_session.commit()
        except Exception as ex:
            await self.db_session.rollback()
            raise BillFasterServiceException(message=repr(ex))

        return {"access_token": access_token, "refresh_token": refresh_token}

    async def oauth_sign_in(self, provider: SocialProvider, request):
        auth_email = None
        if provider.GOOGLE:
            try:
                params = {
                    "code": request.query_params.get("code"),
                    "state": request.query_params.get("state"),
                    "redirect_uri": request.query_params.get("redirect_uri"),
                }
                token = await social_oauth.google.fetch_access_token(**params)
                from google.oauth2 import id_token
                from google.auth.transport import requests

                userinfo = id_token.verify_oauth2_token(
                    token["id_token"], requests.Request(), config.GOOGLE_CLIENT_ID
                )
            except OAuthError as error:
                raise BillFasterServiceException(repr(error))

            auth_email = userinfo.get("email")

        if not auth_email:
            raise BillFasterUnAuthenticatedException()

        try:
            user = await self.get_user_by_email(auth_email)
        except:
            user = await self.create_user(
                user_schema=AuthSignUpSchema(
                    user_id=str(uuid.uuid4()),
                    password=str(uuid.uuid4()),
                    email=auth_email,
                    full_name=userinfo.get("full_name"),
                )
            )

        return await self.auth_generate_token(user)

    async def sign_in(self, user_id, password):
        user = await self.get_user_by_id(user_id)
        if not user:
            raise BillFasterBadRequestException(
                message=_("There is an error in your ID or password!")
            )

        if not verify_password(password, user.password):
            raise BillFasterBadRequestException(
                message=_("There is an error in your ID or password!")
            )

        return self.auth_generate_token(user)

    async def sign_out(self, user_id):
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise BillFasterUnAuthenticatedException()

        token_mngr = await self.get_token_mngr_by_user_id(user_id)
        if token_mngr is None:
            raise BillFasterUnAuthenticatedException()

        del_stt = delete(AuthToken).where(AuthToken.user_id == user_id)
        await self.db_session.execute(del_stt)
        await self.db_session.commit()

    async def get_current_user(self, token):
        try:
            payload = jwt.decode(token, JWT_ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                raise BillFasterUnAuthenticatedException()
        except (JWTError, ValidationError) as ex:
            raise BillFasterUnAuthenticatedException(message=repr(ex))
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise BillFasterUnAuthenticatedException()

        token_mngr = await self.get_token_mngr_by_user_id(user.user_id)
        if token_mngr is None:
            raise BillFasterUnAuthenticatedException()

        return {
            "id": user.id,
            "user_id": user.user_id,
            "email": user.email,
            "user_name": user.user_name,
            "role": user.role,
        }

    async def regenerate_access_token(self, refresh_token: str):
        query = select(AuthToken).filter(AuthToken.token == refresh_token)
        query_set = await self.db_session.execute(query)
        token_mngr = query_set.scalars().first()
        if not token_mngr:
            raise BillFasterUnAuthenticatedException()

        if token_mngr.expires_at < datetime.datetime.utcnow():
            delete_statement = delete(AuthToken).where(
                AuthToken.user_id == token_mngr.user_id
            )
            await self.db_session.execute(delete_statement)
            raise BillFasterUnAuthenticatedException()

        access_token, _ = create_token(
            subject=token_mngr.user_id,
            token_type=TokenType.ACCESS_TOKEN,
        )
        return {"access_token": access_token, "refresh_token": refresh_token}

    async def get_user_by_id(self, user_id: str) -> User:
        query = select(User).filter(User.user_id == user_id, User.deleted_at == None)
        query_set = await self.db_session.execute(query)
        return query_set.scalars().first()

    async def get_user_by_email(self, email: str) -> User:
        query = select(User).filter(User.email == email, User.deleted_at == None)
        query_set = await self.db_session.execute(query)
        return query_set.scalars().one()

    async def get_token_mngr_by_user_id(self, user_id: str):
        query = select(AuthToken).filter(AuthToken.user_id == user_id)
        query_set = await self.db_session.execute(query)
        return query_set.scalars().first()

    async def create_user(self, user_schema: AuthSignUpSchema):
        user = User(
            user_id=user_schema.user_id,
            password=get_hashed_password(user_schema.password),
            email=user_schema.email,
        )
        self.db_session.add(user)
        await self.db_session.flush([user])
        user_profile = UserProfile(
            user_id=user.user_id,
            full_name=user_schema.full_name,
        )
        self.db_session.add(user_profile)
        await self.db_session.commit()
        return user
