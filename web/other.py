import os
from datetime import datetime

from fastapi import APIRouter, Request, Response
from starlette.responses import FileResponse

import config

other_routers = APIRouter()


@other_routers.get("/about")
async def about_page(
    request: Request,
):
    return config.templates.TemplateResponse(
        "about.html",
        {
            "request": request,
            "configs": {
                "google_auth_callback_url": config.GOOGLE_AUTH_TOKEN_CALLBACK_URL,
                "fe_base_uri": config.FRONTEND_BASE_URI,
            },
        },
    )


@other_routers.get("/not-found")
async def not_found_page(
    request: Request,
):
    return config.templates.TemplateResponse(
        "not_found.html",
        {
            "request": request,
            "configs": {
                "fe_base_uri": config.FRONTEND_BASE_URI,
            },
        },
    )


@other_routers.get("/robots.txt")
async def robots_page(
    request: Request,
):
    """Robots.txt with proper headers to avoid Service Worker caching"""
    from fastapi.responses import Response

    robots_content = """User-agent: *
Disallow: /api/
Disallow: /admin/
Allow: /static/assets/css/
Allow: /static/assets/image/
Allow: /static/manifest.json

Sitemap: https://splitbillfaster.com/sitemap.xml"""

    return Response(
        content=robots_content,
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )


@other_routers.get("/ads.txt")
async def ads_page(
    request: Request,
):
    file_path = os.path.join("static", "ads.txt")
    return FileResponse(file_path, media_type="text/plain")


@other_routers.get("/favicon.ico")
async def favicon_page(
    request: Request,
):
    """Favicon with proper headers to avoid Service Worker caching"""
    path = os.path.join("static", "assets", "image", "favicon.ico")
    return FileResponse(path, media_type="image/x-icon")


@other_routers.get("/privacy-policy")
async def privacy_policy_page(
    request: Request,
):
    """Privacy Policy page"""
    return config.templates.TemplateResponse(
        "privacy-policy.html",
        {
            "request": request,
            "configs": {
                "fe_base_uri": config.FRONTEND_BASE_URI,
            },
        },
    )


@other_routers.get("/feedback")
async def feedback_page(
    request: Request,
):
    """Feedback page"""
    return config.templates.TemplateResponse(
        f"feedback.html",
        {
            "request": request,
            "configs": {
                "fe_base_uri": config.FRONTEND_BASE_URI,
            },
        },
    )


@other_routers.get("/sitemap.xml", response_class=Response)
async def get_sitemap():
    date_now = datetime.now().strftime("%Y-%m-%d")
    sitemap_xml = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">"""

    primary_urls = [
        {"path": "", "lastmod": date_now, "changefreq": "daily", "priority": 1.0},
        {
            "path": "/login",
            "lastmod": date_now,
            "changefreq": "monthly",
            "priority": 0.6,
        },
        {
            "path": "/blog",
            "lastmod": date_now,
            "changefreq": "weekly",
            "priority": 0.8,
        },
        {
            "path": "/about",
            "lastmod": "2025-07-06",
            "changefreq": "monthly",
            "priority": 0.5,
        },
        {
            "path": "/privacy-policy",
            "lastmod": "2025-07-12",
            "changefreq": "monthly",
            "priority": 0.5,
        },
    ]

    for url in primary_urls:
        sitemap_xml += f"""
    <url>
        <loc>{config.FRONTEND_BASE_URI}{url['path']}</loc>
        <lastmod>{url['lastmod']}</lastmod>
        <changefreq>{url['changefreq']}</changefreq>
        <priority>{url['priority']}</priority>
    </url>"""

    # Blog posts
    blog_posts = [
        # {
        #     "path": "/blog/hoi-dap-am-lich-phong-thuy-tu-vi-boi-toan-than-so-hoc.html",
        #     "lastmod": "2025-08-23",
        #     "changefreq": "monthly",
        #     "priority": 0.8,
        #     "title": "Hỏi đáp về Âm lịch, Phong thủy, Tử vi, Bói toán, Thần số học",
        #     "description": "Giải đáp các thắc mắc về Âm lịch, Phong thủy, Tử vi, Bói toán, Thần số học trên Nhắc Nhở Lịch Âm.",
        # },
    ]

    for post in blog_posts:
        sitemap_xml += f"""
    <url>
        <loc>{config.FRONTEND_BASE_URI}{post['path']}</loc>
        <lastmod>{post['lastmod']}</lastmod>
        <changefreq>{post['changefreq']}</changefreq>
        <priority>{post['priority']}</priority>
        <image:image>
            <image:loc>{config.FRONTEND_BASE_URI}/static/assets/image/blog/home_logined.jpg</image:loc>
            <image:title>{post['title']}</image:title>
            <image:caption>{post['description']}</image:caption>
        </image:image>
    </url>"""

    sitemap_xml += """
</urlset>"""
    return Response(content=sitemap_xml, media_type="application/xml")
