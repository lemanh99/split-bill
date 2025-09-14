from sqlalchemy import String, Column, Text, DateTime, ForeignKey

from core.common.constants import Role
from core.models import BillFasterBaseModel


class FileSystem(BillFasterBaseModel):
    __tablename__ = "t_file_systems"

    file_name = Column(String(length=255), nullable=False)
    file_path = Column(Text(), nullable=False)
    file_type = Column(String(length=50), nullable=False)
