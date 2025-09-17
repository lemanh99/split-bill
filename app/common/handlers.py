import logging
from http import HTTPStatus

from fastapi.exceptions import RequestValidationError
from starlette.requests import Request
from starlette.responses import JSONResponse

from core.common.exceptions import BillFasterBaseException

logger = logging.getLogger(__name__)


def base_error_handler(request: Request, exception: BillFasterBaseException):
    logger.exception(msg="Record error", exc_info=exception)

    status_code = (
        exception.code
        if isinstance(exception, BillFasterBaseException)
        else HTTPStatus.INTERNAL_SERVER_ERROR
    )
    message, param = (
        (exception.message, exception.kwargs)
        if isinstance(exception, BillFasterBaseException)
        else (str(exception), None)
    )
    return JSONResponse(
        status_code=status_code,
        content={
            "status_code": status_code,
            "errors": [message],
        },
    )


def validation_exception_handler(request: Request, exception: RequestValidationError):
    errs = []
    for err in exception.errors():
        if err["type"] == "value_error":
            error_ctx = err.get("ctx", {}).get("error")
            error_message = str(error_ctx) if error_ctx else err.get("msg")
            error_key = (
                err.get("loc")[1] if len(err.get("loc")) > 1 else err.get("loc")[0]
            )
            errs.append({error_key: error_message})
        else:
            errs.append({err["loc"][0]: err.get("msg")})

    return JSONResponse(status_code=400, content={"errors": errs})
