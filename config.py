import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi_babel import BabelConfigs
from sqlalchemy import URL
from starlette.config import Config
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

load_dotenv()

BASE_DIR = Path(__file__).parent.resolve()

# --------------------------- ENVIRONMENT --------------------------------
ENVIRONMENT = os.getenv("ENVIRONMENT", "pro")
API_SECRET_KEY = os.getenv("API_SECRET_KEY")
BASE_URL = os.getenv("BASE_URL")
API_TIMEOUT_ALIVE = int(os.getenv("API_TIMEOUT_ALIVE", 60))
WORKER_NUM = int(os.getenv("WORKER_NUM", 4))
API_PORT = int(os.getenv("API_PORT", 8000))
# --------------------------- LOGGER --------------------------------
LOGGER_FORMAT = os.getenv("LOGGER_FORMAT")
LOGGER_LEVEL = os.getenv("LOGGER_LEVEL")

# --------------------------- JWT --------------------------------
JWT_ACCESS_SECRET_KEY = os.getenv("JWT_ACCESS_SECRET_KEY")
JWT_REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRED = int(os.getenv("ACCESS_TOKEN_EXPIRED"))
REFRESH_TOKEN_EXPIRED = int(os.getenv("REFRESH_TOKEN_EXPIRED"))

# --------------------------- CORS --------------------------------
CORS_ALLOWED_ORIGINS: list = [
    *(filter(lambda x: len(x) > 0, os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")))
]

# =========================== DATABASE ===============================
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_PORT = os.getenv("DATABASE_PORT")
DATABASE_NAME = os.getenv("DATABASE_NAME")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_CONN_POOL_SIZE = int(os.getenv("DATABASE_CONN_POOL_SIZE", 10))

ASYNC_DATABASE_CONN_URL = URL.create(
    "postgresql+asyncpg",
    host=DATABASE_HOST,
    port=DATABASE_PORT,
    database=DATABASE_NAME,
    username=DATABASE_USER,
    password=DATABASE_PASSWORD,
)
DATABASE_CONN_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

# --------------------------- FASTAPI --------------------------------
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))
statics = StaticFiles(directory=os.path.join(BASE_DIR, "statics"))
image_statics = os.path.join("assets", "images", "apps")
babel_configs = BabelConfigs(
    ROOT_DIR=Path(__file__).resolve(),
    BABEL_DEFAULT_LOCALE=os.getenv("BABEL_DEFAULT_LOCALE", default="en"),
    BABEL_TRANSLATION_DIRECTORY=os.path.join(BASE_DIR, "i18n"),
)

# --------------------------- DEFAULT --------------------------------
DEFAULT_LANGUAGE_MESSAGE = "en"
DEFAULT_TIMEZONE_SERVER = os.getenv("DEFAULT_TIMEZONE_SERVER", "UTC")
DEFAULT_TIMEZONE_USER = os.getenv("DEFAULT_TIMEZONE_USER", "UTC")

# ---------------------------- AWS --------------------------------
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
AWS_S3_ENDPOINT_URL = os.getenv("AWS_S3_ENDPOINT_URL")


# --------------------------- SOCIAL --------------------------------
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_AUTH_LOGIN_URL = os.getenv("GOOGLE_AUTH_LOGIN_URL")
GOOGLE_AUTH_TOKEN_CALLBACK_URL = os.getenv("GOOGLE_AUTH_TOKEN_CALLBACK_URL")
starlette_config = Config(
    environ={
        "GOOGLE_CLIENT_ID": GOOGLE_CLIENT_ID,
        "GOOGLE_CLIENT_SECRET": GOOGLE_CLIENT_SECRET,
    }
)
