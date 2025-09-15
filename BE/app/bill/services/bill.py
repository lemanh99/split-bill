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


class BillService(BillFasterBaseService):
    pass