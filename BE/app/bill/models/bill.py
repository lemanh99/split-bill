from sqlalchemy import String, Column, Text, DateTime, ForeignKey, Numeric, SmallInteger, Boolean, Integer

from app.common.constants import BillType, BillShareType, BillStatus
from core.common.constants import Role
from core.models import BillFasterBaseModel


class Bill(BillFasterBaseModel):
    __tablename__ = "t_bills"

    bill_number = Column(String(length=100), unique=True, nullable=False, index=True)
    bill_file_id = Column(Integer, nullable=True)

    type = Column(SmallInteger, nullable=False, default=BillType.SIMPLE)
    share_type = Column(SmallInteger, nullable=False, default=BillShareType.PUBLIC)
    status = Column(SmallInteger, nullable=False, default=BillStatus.DRAFT)
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

    payment_flag = Column(Boolean, nullable=False, default=False)
    payment_method = Column(SmallInteger, nullable=True)
    payment_note = Column(Text, nullable=True)
    payment_file_id = Column(Integer, nullable=True)

class BillItem(BillFasterBaseModel):
    __tablename__ = "t_bill_items"

    bill_id = Column(ForeignKey("t_bills.id"), nullable=False, index=True)
    name = Column(String(length=100), nullable=True)
    description = Column(String(length=255), nullable=True)
    quantity = Column(Numeric(10, 2), nullable=True, default=1)
    unit_price = Column(Numeric(16, 2), nullable=True)
    total = Column(Numeric(16, 2), nullable=True)


class BillParticipant(BillFasterBaseModel):
    __tablename__ = "t_bill_participants"

    bill_id = Column(ForeignKey("t_bills.id"), nullable=False, index=True)
    bill_item_id = Column(ForeignKey("t_bill_items.id"), nullable=True, index=True)
    amount = Column(Numeric(16, 2), nullable=False)
    email = Column(String(length=255), nullable=True)
    description = Column(String(length=255), nullable=True)
    payment_flag = Column(Boolean, nullable=False, default=False)

