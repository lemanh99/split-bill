from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import ValidationError
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse

import config
from api.routers import routers
from app.common.handlers import base_error_handler, validation_exception_handler
from app.common.middlewares.language import LanguageBabelMiddleware
from core.common.exceptions import BillFasterBaseException

if config.ENVIRONMENT == "pro":
    docs_url, redoc_url, openapi_url = None, None, None
else:
    docs_url, redoc_url, openapi_url = "/docs", "/redoc", "/openapi.json"
app = FastAPI(
    title="BillFaster app service",
    swagger_ui_parameters={
        "persistAuthorization": True,
    },
    docs_url=docs_url,
    redoc_url=redoc_url,
    openapi_url=openapi_url,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    LanguageBabelMiddleware,
    babel_configs=config.babel_configs,
    jinja2_templates=config.templates,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_exception_handler(BillFasterBaseException, base_error_handler)
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, base_error_handler)

app.mount("/static", config.statics, name="static")
app.include_router(routers, prefix="/api")


@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: Exception):
    return RedirectResponse(url="/not-found")
