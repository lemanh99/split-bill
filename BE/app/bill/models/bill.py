from sqlalchemy import String, Column, Text, DateTime, ForeignKey, Numeric, SmallInteger, Boolean, Integer

from app.common.constants import BillType
from core.common.constants import Role
from core.models import BillFasterBaseModel


class Bill(BillFasterBaseModel):
    __tablename__ = "t_bills"

    bill_number = Column(String(length=100), unique=True, nullable=False)
    type = Column(SmallInteger, nullable=False, default=BillType.SIMPLE)
    subtotal = Column(Numeric(16, 2), nullable=False)
    tax_flag = Column(Boolean, nullable=False, default=False)
    tax_percent = Column(Numeric(5, 2), nullable=True)
    tax_amount = Column(Numeric(16, 2), nullable=True)
    tip_flag = Column(Boolean, nullable=False, default=False)
    tip_percent = Column(Numeric(5, 2), nullable=True)
    tip_amount = Column(Numeric(16, 2), nullable=True)
    total = Column(Numeric(16, 2), nullable=False)
    currency = Column(String(length=10), nullable=False, default="USD")
    number_people = Column(Integer, nullable=False, default=1)
    payment_method = Column(String(length=50), nullable=True)

class BillItem(BillFasterBaseModel):
    __tablename__ = "t_bill_items"

    bill_id = Column(ForeignKey("t_bills.id"), nullable=False, index=True)
    description = Column(String(length=255), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False, default=1)
    unit_price = Column(Numeric(16, 2), nullable=False)
    total_price = Column(Numeric(16, 2), nullable=False)

