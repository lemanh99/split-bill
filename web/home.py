from fastapi import APIRouter, Request

import config

home_routers = APIRouter()


@home_routers.get("/login")
async def login_page(
    request: Request,
):
    return config.templates.TemplateResponse(
        "login.html",
        {
            "request": request,
            "configs": {
                "google_auth_callback_url": config.GOOGLE_AUTH_TOKEN_CALLBACK_URL,
                "fe_base_uri": config.FRONTEND_BASE_URI,
            },
        },
    )


@home_routers.get("/")
async def home_page(
    request: Request,
):
    return config.templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "configs": {
                "google_auth_callback_url": config.GOOGLE_AUTH_TOKEN_CALLBACK_URL,
                "fe_base_uri": config.FRONTEND_BASE_URI,
            },
        },
    )


@home_routers.get("/bill/share/{bill_number}")
async def share_bill_page(
    request: Request,
    bill_number: str,
):
    return config.templates.TemplateResponse(
        "share.html",
        {
            "request": request,
            "configs": {
                "google_auth_callback_url": config.GOOGLE_AUTH_TOKEN_CALLBACK_URL,
                "fe_base_uri": config.FRONTEND_BASE_URI,
                "bill_number": bill_number,
            },
        },
    )
