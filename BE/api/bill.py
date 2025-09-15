from fastapi import APIRouter, Depends

from app.bill.schemas.bill import BillCrUpSchema
from app.bill.services.bill import BillService
from app.common.response import make_success_response
from core.common.database import get_async_db_session

router = APIRouter(
    prefix="/bill", tags=["bill"], responses={404: {"description": "Not found"}}
)


@router.get("/{bill_number}")
async def get_bill(
    bill_number: str,
    db_session=Depends(get_async_db_session),
):
    bill_service = BillService(db_session)
    result = await bill_service.get_by_bill_number(bill_number)
    return make_success_response(result)


@router.post("/create")
async def create_bill(
    create_schema: BillCrUpSchema,
    db_session=Depends(get_async_db_session),
):
    bill_service = BillService(db_session)
    result = await bill_service.create(create_schema)
    return make_success_response(result)


@router.put("/{bill_number}/update")
async def update_bill(
    bill_number: str,
    update_schema: BillCrUpSchema,
    db_session=Depends(get_async_db_session),
):
    bill_service = BillService(db_session)
    result = await bill_service.update(bill_number, update_schema)
    return make_success_response(result)
