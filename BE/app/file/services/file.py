from io import BytesIO

from fastapi import UploadFile

import config
from app.file.models import FileSystem
from core.services.aws import S3Service
from core.services.base import BillFasterBaseService


class FileService(BillFasterBaseService):
    async def upload_file(self, upload_file: UploadFile):
        s3_service = S3Service()
        file_url = s3_service.bucket_upload_object(
            bucket_name=config.AWS_S3_BUCKET_NAME,
            file_key=f"bill-uploads/{upload_file.filename}",
            file_content=upload_file.file,
            ContentType=upload_file.content_type,
        )
        file_system = FileSystem(
            file_name=upload_file.filename,
            file_path=file_url,
            file_type=upload_file.content_type,
        )
        self.db_session.add(file_system)
        await self.db_session.commit()
        await self.db_session.refresh(file_system)
        return {
            "id": file_system.id,
            "file_name": file_system.file_name,
            "file_path": file_system.file_path,
            "file_type": file_system.file_type,
        }

    async def get_url(self, file_id: int):
        file_system = await self.db_session.get(FileSystem, file_id)
        if not file_system:
            return None

        s3_service = S3Service()
        url = s3_service.file_download_generate_presigned_url(file_system.file_path)
        return {
            "file_name": file_system.file_name,
            "file_type": file_system.file_type,
            "file_url": url,
        }

    async def delete_file(self, file_id: int):
        file_system = await self.db_session.get(FileSystem, file_id)
        if not file_system:
            return None

        s3_service = S3Service()
        s3_service.bucket_delete_file_url(file_system.file_path)

        await self.db_session.delete(file_system)
        await self.db_session.commit()
        return {"message": "File deleted successfully"}
