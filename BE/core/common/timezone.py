from contextvars import ContextVar

import config

_user_timezone_context: ContextVar[str] = ContextVar(
    "_user_timezone", default=config.DEFAULT_TIMEZONE_USER
)


class Timezone:
    @staticmethod
    def set_user_timezone(time_zone: str = None) -> None:
        _user_timezone_context.set(time_zone)

    @staticmethod
    def get_user_timezone() -> str:
        return _user_timezone_context.get()
