from datetime import datetime

from sqlalchemy import DateTime, Column, String, Integer
from sqlalchemy.orm import DeclarativeBase


class BillFasterBaseModel(DeclarativeBase):
    id = Column(Integer, primary_key=True, unique=True, index=True, autoincrement=True)
    created_at = Column(DateTime, nullable=True, default=datetime.now)
    created_by = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(String, nullable=True)
    deleted_at = Column(DateTime, nullable=True, default=None)
    deleted_by = Column(String, nullable=True, default=None)
