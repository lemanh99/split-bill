import re

from fastapi import Request, Response
from fastapi_babel import BabelMiddleware
from fastapi_babel.core import _context_var, Babel
from starlette.middleware.base import RequestResponseEndpoint

import config


class LanguageBabelMiddleware(BabelMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        url = request.url.path
        if url.startswith("/static"):
            response: Response = await call_next(request)
            return response

        lang_code: str = request.headers.get(
            "Accept-Language", config.DEFAULT_LANGUAGE_MESSAGE
        )

        # Create a new Babel instance per request
        request.state.babel = Babel(configs=self.babel_configs)
        request.state.babel.locale = self.get_language(request.state.babel, lang_code)
        _context_var.set(
            request.state.babel.gettext
        )  # Set the _ function in the context variable
        if self.jinja2_templates:
            request.state.babel.install_jinja(self.jinja2_templates)

        response: Response = await call_next(request)
        return response
