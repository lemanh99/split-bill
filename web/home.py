from fastapi import APIRouter, Request

import config

home_routers = APIRouter()


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
