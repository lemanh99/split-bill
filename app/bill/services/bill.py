import datetime
import uuid

from sqlalchemy import Delete, Select

from app.auth.models import User
from app.bill.models import Bill, BillItem, BillParticipant
from app.bill.schemas.bill import BillCrUpSchema, BillItemCrUpSchema, BillDetailSchema
from app.common.constants import BillShareType
from app.file.services.file import FileService
from core.common.exceptions import (
    BillFasterBadRequestException,
    BillFasterNotFoundException,
    BillFasterBaseException,
)
from core.services.base import BillFasterBaseService


class BillService(BillFasterBaseService):
    async def _get_bill_by_bill_number(self, bill_number: str):
        query = Select(Bill).where(Bill.bill_number == bill_number)
        result = await self.db_session.execute(query)
        return result.scalars().one_or_none()

    async def _get_bill_items(self, bill_id: int):
        query = Select(BillItem).where(BillItem.bill_id == bill_id)
        result = await self.db_session.execute(query)
        return result.scalars().all()

    async def _get_bill_participants(self, bill_id: int):
        query = Select(BillParticipant).where(BillParticipant.bill_id == bill_id)
        result = await self.db_session.execute(query)
        return result.scalars().all()

    async def _create_or_update_bill_items(
        self, bill_id, bill_items: list[BillItemCrUpSchema]
    ):
        delete_query = Delete(BillItem).where(BillItem.bill_id == bill_id)
        await self.db_session.execute(delete_query)
        items = []
        for item in bill_items:
            data_fields = item.model_dump()
            data_fields["bill_id"] = bill_id
            new_bill_item = BillItem(**data_fields)
            items.append(new_bill_item)

        self.db_session.add_all(items)

    async def _create_or_update_bill_participants(
        self, bill_id, bill_participants: list
    ):
        delete_query = Delete(BillParticipant).where(BillParticipant.bill_id == bill_id)
        await self.db_session.execute(delete_query)
        participants = []
        for participant in bill_participants:
            data_fields = participant.model_dump()
            data_fields["bill_id"] = bill_id
            new_bill_participant = BillParticipant(**data_fields)
            participants.append(new_bill_participant)

        self.db_session.add_all(participants)

    async def create(self, user: dict | None, create_schema: BillCrUpSchema):
        try:
            if create_schema.share_type == BillShareType.PRIVATE and not user:
                raise BillFasterBadRequestException(
                    message="User must be authenticated for private bills"
                )

            data_fields = create_schema.model_dump(
                exclude={"bill_items", "bill_participants"}
            )
            data_fields["bill_number"] = (
                f"BF{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())}".replace(
                    "-", ""
                )
            )
            data_fields["created_by"] = user['user_id'] if user else None
            new_bill = Bill(**data_fields)
            self.db_session.add(new_bill)
            await self.db_session.flush()
            await self._create_or_update_bill_items(
                new_bill.id, create_schema.bill_items
            )
            await self._create_or_update_bill_participants(
                new_bill.id, create_schema.bill_participants
            )
            await self.db_session.commit()
            await self.db_session.refresh(new_bill)
            return {
                "bill_number": new_bill.bill_number,
            }
        except BillFasterBaseException as ex:
            raise ex

        except Exception as e:
            raise BillFasterBadRequestException()

    async def update(
        self, user: dict | None, bill_number: str, update_schema: BillCrUpSchema
    ):
        bill = await self._get_bill_by_bill_number(bill_number)
        if not bill:
            raise BillFasterNotFoundException()
        try:
            if bill.share_type == BillShareType.PRIVATE and not user:
                raise BillFasterBadRequestException(
                    message="User must be authenticated for private bills"
                )

            data_fields = update_schema.model_dump(
                exclude={"bill_items", "bill_participants", "bill_number"}
            )
            for key, value in data_fields.items():
                setattr(bill, key, value)

            setattr(
                bill,
                "created_by",
                user['user_id'] if user and not bill.created_by else bill.created_by,
            )
            setattr(bill, "updated_by", user['user_id'] if user else None)
            await self._create_or_update_bill_items(bill.id, update_schema.bill_items)
            await self._create_or_update_bill_participants(
                bill.id, update_schema.bill_participants
            )
            await self.db_session.commit()
            return {
                "bill_number": bill_number,
            }
        except BillFasterBaseException as ex:
            raise ex
        except Exception as e:
            raise BillFasterBadRequestException()

    async def get_by_bill_number(self, user, bill_number: str) -> dict:
        try:
            bill = await self._get_bill_by_bill_number(bill_number)
            if not bill or (bill.share_type == BillShareType.PRIVATE and not user):
                raise BillFasterNotFoundException()

            bill_items = await self._get_bill_items(bill.id)
            setattr(bill, "bill_items", bill_items)
            bill_participants = await self._get_bill_participants(bill.id)
            setattr(bill, "bill_participants", bill_participants)

            result = BillDetailSchema.model_validate(bill).model_dump()
            file_service = FileService(self.db_session)
            if bill.bill_file_id:
                file_url = await file_service.get_url(bill.bill_file_id)
                result["bill_file_url"] = file_url.get("file_url")

            if bill.payment_file_id:
                file_url = await file_service.get_url(bill.payment_file_id)
                result["payment_file_url"] = file_url.get("file_url")

            return result
        except BillFasterBaseException as ex:
            raise ex
        except Exception as e:
            raise BillFasterBadRequestException()

    async def get_shared_by_bill_number(self, user, bill_number: str) -> dict:
        try:
            bill = await self._get_bill_by_bill_number(bill_number)
            if not bill or (bill.share_type == BillShareType.PRIVATE and not user):
                raise BillFasterNotFoundException()

            bill_participants = await self._get_bill_participants(bill.id)
            if (
                bill.share_type == BillShareType.PRIVATE
                and user
                and bill.created_by != user['user_id']
            ):
                email_participants = [
                    participant.email
                    for participant in bill_participants
                    if participant.email
                ]
                if user['email'] not in email_participants:
                    raise BillFasterNotFoundException()

            setattr(bill, "bill_participants", bill_participants)
            bill_items = await self._get_bill_items(bill.id)
            setattr(bill, "bill_items", bill_items)
            result = BillDetailSchema.model_validate(bill).model_dump()
            file_service = FileService(self.db_session)
            if bill.bill_file_id:
                file_url = await file_service.get_url(bill.bill_file_id)
                result["bill_file_url"] = file_url.get("file_url")

            if bill.payment_file_id:
                file_url = await file_service.get_url(bill.payment_file_id)
                result["payment_file_url"] = file_url.get("file_url")

            return result
        except BillFasterBaseException as ex:
            raise ex
        except Exception as e:
            raise BillFasterBadRequestException()
