from http import HTTPStatus


def make_success_response(data):
    return {
        "status_code": HTTPStatus.OK,
        "errors": {},
        "data": data,
    }


def make_system_error_response(code: int, content: str):
    return {
        "status_code": HTTPStatus.INTERNAL_SERVER_ERROR,
        "errors": {"code": code, "content": content},
        "data": [],
    }


def make_bad_request_response(
    code=HTTPStatus.BAD_REQUEST, message: str = None, param=None
):
    return {
        "status_code": code,
        "errors": {"code": code, "message": message},
        "message": message,
        "param": param,
    }


def make_not_found_response(content: str):
    return {
        "status_code": HTTPStatus.NOT_FOUND,
        "errors": {"code": 404, "content": content},
        "data": [],
    }
