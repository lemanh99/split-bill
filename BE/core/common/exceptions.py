from fastapi_babel import _
from starlette import status


class BillFasterBaseException(Exception):
    def __init__(self, status_code, message, **kwargs):
        self.code = status_code
        self.message = message
        self.kwargs = kwargs
        super().__init__(message, status_code)


class BillFasterSystemException(BillFasterBaseException):
    def __init__(
        self, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, message=None, **kwargs
    ):
        super().__init__(status_code, message or _("System error!"), **kwargs)


class BillFasterServiceException(BillFasterBaseException):
    def __init__(
        self, status_code=status.HTTP_503_SERVICE_UNAVAILABLE, message=None, **kwargs
    ):
        super().__init__(status_code, message or _("Service error!"), **kwargs)


class BillFasterNotFoundException(BillFasterBaseException):
    def __init__(self, status_code=status.HTTP_404_NOT_FOUND, message=None, **kwargs):
        super().__init__(status_code, message or _("Not found!"), **kwargs)


class BillFasterBadRequestException(BillFasterBaseException):
    def __init__(self, status_code=status.HTTP_400_BAD_REQUEST, message=None, **kwargs):
        super().__init__(status_code, message or _("Bad request!"), **kwargs)


class BillFasterUnAuthenticatedException(BillFasterBaseException):
    def __init__(
        self, status_code=status.HTTP_401_UNAUTHORIZED, message=None, **kwargs
    ):
        super().__init__(status_code, message or _("UnAuthenticated"), **kwargs)
