from enum import Enum


class TokenType(str, Enum):
    ACCESS_TOKEN = "ACCESS_TOKEN"
    REFRESH_TOKEN = "REFRESH_TOKEN"
    RESET_PASSWORD_TOKEN = "RESET_PASSWORD_TOKEN"

class Role(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    USER = "USER"