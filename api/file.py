from fastapi import APIRouter, Depends, UploadFile, File

from app.common.response import make_success_response
from app.file.services.file import FileService
from core.common.database import get_async_db_session

router = APIRouter(
    prefix="/file", tags=["file"], responses={404: {"description": "Not found"}}
)


@router.get("/{file_id}/presigned-url")
async def get_file_url(
    file_id: int,
    db_session=Depends(get_async_db_session),
):
    file_service = FileService(db_session)
    result = await file_service.get_url(file_id)
    return make_success_response(result)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db_session=Depends(get_async_db_session),
):
    file_service = FileService(db_session)
    result = await file_service.upload_file(file)
    return make_success_response(result)


@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    db_session=Depends(get_async_db_session),
):
    file_service = FileService(db_session)
    result = await file_service.delete_file(file_id)
    return make_success_response(result)
