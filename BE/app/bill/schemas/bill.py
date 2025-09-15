# from sqlalchemy import String, Column, Text, DateTime, ForeignKey, Numeric, SmallInteger, Boolean, Integer
#
# from app.common.constants import BillType, BillShareType, BillStatus
# from core.common.constants import Role
# from core.models import BillFasterBaseModel
#
#
# class Bill(BillFasterBaseModel):
#     __tablename__ = "t_bills"
#
#     bill_number = Column(String(length=100), unique=True, nullable=False, index=True)
#     bill_file_id = Column(ForeignKey("t_file_systems.id"), nullable=True, index=True)
#
#     type = Column(SmallInteger, nullable=False, default=BillType.SIMPLE)
#     share_type = Column(SmallInteger, nullable=False, default=BillShareType.PUBLIC)
#     status = Column(SmallInteger, nullable=False, default=BillStatus.DRAFT)
#     subtotal = Column(Numeric(16, 2), nullable=False)
#     tax_flag = Column(Boolean, nullable=False, default=False)
#     tax_percent = Column(Numeric(5, 2), nullable=True)
#     tax_amount = Column(Numeric(16, 2), nullable=True)
#     tip_flag = Column(Boolean, nullable=False, default=False)
#     tip_percent = Column(Numeric(5, 2), nullable=True)
#     tip_amount = Column(Numeric(16, 2), nullable=True)
#     total = Column(Numeric(16, 2), nullable=False)
#     currency = Column(String(length=10), nullable=False, default="USD")
#     number_people = Column(Integer, nullable=False, default=1)
#
#     payment_flag = Column(Boolean, nullable=False, default=False)
#     payment_method = Column(SmallInteger, nullable=True)
#     payment_note = Column(Text, nullable=True)
#     payment_file_id = Column(ForeignKey("t_file_systems.id"), nullable=True)
#
# class BillItem(BillFasterBaseModel):
#     __tablename__ = "t_bill_items"
#
#     bill_id = Column(ForeignKey("t_bills.id"), nullable=False, index=True)
#     name = Column(String(length=100), nullable=True)
#     description = Column(String(length=255), nullable=True)
#     quantity = Column(Numeric(10, 2), nullable=True, default=1)
#     unit_price = Column(Numeric(16, 2), nullable=True)
#     total = Column(Numeric(16, 2), nullable=True)
#
#
# class BillParticipant(BillFasterBaseModel):
#     __tablename__ = "t_bill_participants"
#
#     bill_id = Column(ForeignKey("t_bills.id"), nullable=False, index=True)
#     bill_item_id = Column(ForeignKey("t_bill_items.id"), nullable=True, index=True)
#     amount = Column(Numeric(16, 2), nullable=False)
#     email = Column(String(length=255), nullable=True)
#     description = Column(String(length=255), nullable=True)
#     payment_flag = Column(Boolean, nullable=False, default=False)
from decimal import Decimal

from pydantic import Field, BaseModel

from app.common.constants import BillType, BillShareType


class BillParticipantCrUpSchema(BaseModel):
    amount: Decimal = Field(...)
    email: str | None = Field(default=None)
    description: str | None = Field(default=None)
    payment_flag: bool = Field(default=False)


class BillItemCrUpSchema(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    quantity: Decimal = Field(default=1, ge=0)
    unit_price: Decimal | None = Field(default=None, ge=0)
    total: Decimal | None = Field(default=None, ge=0)


class BillCrUpSchema(BaseModel):
    bill_file_id: int | None = Field(default=None)
    type: BillType = Field(...)
    share_type: BillShareType = Field(...)
    subtotal: Decimal = Field(...)

    tax_flag: bool = Field(default=False)
    tax_percent: Decimal | None = Field(default=None)
    tax_amount: Decimal | None = Field(default=None)

    tip_flag: bool = Field(default=False)
    tip_percent: Decimal | None = Field(default=None)
    tip_amount: Decimal | None = Field(default=None)
    total: Decimal = Field(...)

    currency: str = Field(default="USD")
    number_people: int = Field(..., ge=1)

    payment_flag: bool = Field(default=False)
    payment_method: int | None = Field(default=None)
    payment_note: str | None = Field(default=None, max_length=255)
    payment_file_id: int | None = Field(default=None)
    bill_items: list[BillItemCrUpSchema] = Field(default_factory=list)
    bill_participants: list[BillParticipantCrUpSchema] = Field(default_factory=list)
