from fastapi import Depends

from core.common.constants import Role
from .auth import auth_verify
from .exceptions import BillFasterPermissionDeniedException


class AllowRolePermissions:
    def __init__(self, roles: list[Role]) -> None:
        self.roles = roles

    def __call__(self, current_user=Depends(auth_verify)) -> bool:
        if current_user["role"] not in self.roles:
            raise BillFasterPermissionDeniedException()
        return True
