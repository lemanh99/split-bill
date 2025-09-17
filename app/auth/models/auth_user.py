from sqlalchemy import String, Column, Text, DateTime, ForeignKey

from core.common.constants import Role
from core.models import BillFasterBaseModel


class User(BillFasterBaseModel):
    __tablename__ = "t_users"

    user_id = Column(String(length=255), unique=True, nullable=False)
    password = Column(Text())
    email = Column(String(length=255), unique=True, nullable=False)
    role = Column(String(), default=Role.USER)


class UserProfile(BillFasterBaseModel):
    __tablename__ = "t_user_profiles"

    user_id = Column(ForeignKey("t_users.user_id"), nullable=False, unique=True)
    full_name = Column(String(length=255), nullable=False)


class AuthToken(BillFasterBaseModel):
    __tablename__ = "t_auth_token"

    token = Column(Text())
    user_id = Column(String(length=15))
    expires_at = Column(DateTime, default=None, nullable=True)
