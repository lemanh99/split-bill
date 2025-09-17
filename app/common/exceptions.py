from fastapi_babel import _
from starlette import status

from core.common.exceptions import BillFasterBaseException


class BillFasterUnAuthenticateException(BillFasterBaseException):
    def __init__(
        self, status_code=status.HTTP_401_UNAUTHORIZED, message=None, **kwargs
    ):
        super().__init__(status_code, message or _("Un-Authentication!"), **kwargs)


class BillFasterPermissionDeniedException(BillFasterBaseException):
    def __init__(self, status_code=status.HTTP_403_FORBIDDEN, message=None, **kwargs):
        super().__init__(status_code, message or _("Permission Denied"), **kwargs)
