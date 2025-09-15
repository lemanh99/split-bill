from datetime import datetime
from decimal import Decimal

from pydantic import Field, BaseModel, ConfigDict

from app.common.constants import BillType, BillShareType


class BillParticipantCrUpSchema(BaseModel):
    amount: Decimal = Field(...)
    email: str | None = Field(default=None)
    description: str | None = Field(default=None)


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

class BillParticipantDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    amount: Decimal = Field(...)
    email: str | None = Field(default=None)
    description: str | None = Field(default=None)
    payment_flag: bool = Field(default=False)


class BillItemDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    quantity: Decimal = Field(default=1, ge=0)
    unit_price: Decimal | None = Field(default=None, ge=0)
    total: Decimal | None = Field(default=None, ge=0)


class BillDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    bill_file_url: str | None = Field(default=None)
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
    payment_file_url: str | None = Field(default=None)
    bill_items: list[BillItemDetailSchema] = Field(default_factory=list)
    bill_participants: list[BillParticipantDetailSchema] = Field(default_factory=list)
    created_at: datetime = Field(...)

