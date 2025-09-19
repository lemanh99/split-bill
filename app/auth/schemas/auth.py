from datetime import datetime

from pydantic import BaseModel


class AuthLoginSchema(BaseModel):
    user_id: str
    password: str

    class Config:
        json_schema_extra = {"example": {"user_id": "admin", "password": "Aa@123456"}}


class AuthSignUpSchema(BaseModel):
    user_id: str
    password: str
    email: str
    full_name: str
    birthday: datetime | None = None
    avatar: str | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "admin",
                "password": "Aa@123456",
                "name": "Admin User",
            }
        }
