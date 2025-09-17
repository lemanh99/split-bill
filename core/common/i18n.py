from contextvars import ContextVar

import config

_language_context: ContextVar[str] = ContextVar(
    "_language", default=config.DEFAULT_LANGUAGE_MESSAGE
)


class I18N:
    @staticmethod
    def set_language(language: str = None) -> None:
        _language_context.set(language)

    @staticmethod
    def get_language() -> str:
        return _language_context.get()
