from datetime import datetime, timedelta
from typing import Union, Any

from fastapi_babel import _
from jose import jwt
from passlib.context import CryptContext

from config import (
    REFRESH_TOKEN_EXPIRED,
    ACCESS_TOKEN_EXPIRED,
    JWT_ACCESS_SECRET_KEY,
    ALGORITHM,
    JWT_REFRESH_SECRET_KEY,
)
from core.common.constants import TokenType
from core.common.exceptions import BillFasterBadRequestException

crypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return crypt_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return crypt_context.verify(password, hashed_password)


def create_token(
    subject: Union[dict, Any], token_type: TokenType = TokenType.REFRESH_TOKEN
) -> tuple[str, datetime]:
    if token_type == TokenType.REFRESH_TOKEN:
        expires_delta = datetime.utcnow() + timedelta(minutes=REFRESH_TOKEN_EXPIRED)
        to_encode = {"exp": expires_delta, "sub": subject}
        token = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, ALGORITHM)
    elif token_type == TokenType.ACCESS_TOKEN:
        expires_delta = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRED)
        to_encode = {"exp": expires_delta, "sub": subject}
        token = jwt.encode(to_encode, JWT_ACCESS_SECRET_KEY, ALGORITHM)
    elif token_type == TokenType.RESET_PASSWORD_TOKEN:
        expires_delta = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRED)
        to_encode = {"exp": expires_delta, "sub": subject}
        token = jwt.encode(to_encode, JWT_ACCESS_SECRET_KEY, ALGORITHM)
    else:
        raise BillFasterBadRequestException(message=_("Token type not allow"))
    return token, expires_delta
