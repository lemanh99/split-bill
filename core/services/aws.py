import logging
from urllib.parse import urlparse

import boto3
from botocore.exceptions import ClientError
from fastapi_babel import _

import config
from core.common.exceptions import BillFasterServiceException
from core.common.loggers import logger


class S3Service:
    def __init__(self, **kwargs):
        session = boto3.Session(
            region_name=config.AWS_REGION,
            aws_access_key_id=config.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
            **kwargs,
        )
        self.client = session.client(
            "s3",
            endpoint_url=config.AWS_S3_ENDPOINT_URL,
        )

    def bucket_upload_object(self, bucket_name, file_key, file_content, **kwargs):
        try:
            self.client.upload_fileobj(
                file_content, Bucket=bucket_name, Key=file_key, ExtraArgs=kwargs
            )
            return "%s/%s/%s" % (self.client.meta.endpoint_url, bucket_name, file_key)

        except Exception as ex:
            raise BillFasterServiceException(
                message=_("Upload to storage failed! Error {ex}").format(ex=repr(ex))
            )

    def bucket_download_file_to_temp(self, url):
        try:
            bucket_file_path = urlparse(url).path.lstrip("/")
            bucket_name = bucket_file_path.split("/", 1)[0]
            file_key = bucket_file_path.split("/", 1)[1]
            s3_response_object = self.client.get_object(
                Bucket=bucket_name, Key=file_key
            )
            content = s3_response_object["Body"].read()
            return content
        except self.client.exceptions.NoSuchKey:
            raise BillFasterServiceException(
                message=_(
                    "Download from storage failed! Not found with {url}".format(url=url)
                )
            )
        except Exception as ex:
            raise BillFasterServiceException(
                message=_(
                    "Download from storage failed! Error {ex}".format(ex=repr(ex))
                )
            )

    def bucket_delete_file_url(self, url):
        try:
            bucket_file_path = urlparse(url).path.lstrip("/")
            bucket_name = bucket_file_path.split("/", 1)[0]
            file_key = bucket_file_path.split("/", 1)[1]
            self.client.delete_object(Bucket=bucket_name, Key=file_key)
        except Exception as ex:
            raise BillFasterServiceException(
                message=_(
                    "Delete file with url {url} error: {detail}".format(
                        url=url, detail=str(ex)
                    )
                )
            )

    def file_download_generate_presigned_url(self, url):
        try:
            bucket_file_path = urlparse(url).path.lstrip("/")
            bucket_name = bucket_file_path.split("/", 1)[0]
            file_key = bucket_file_path.split("/", 1)[1]
            response = self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": file_key},
            )
            return response
        except Exception as e:
            logging.error(e)
            return None

    def bucket_get_object(self, url):
        try:
            bucket_file_path = urlparse(url).path.lstrip("/")
            bucket_name, file_prefix = bucket_file_path.split("/", 1)
            response = self.client.get_object(Bucket=bucket_name, Key=file_prefix)
            return response["Body"].read()
        except ClientError as ex:
            logger.warning(f"Error while getting file from S3 bucket: {ex}")
            return None
        except Exception as ex:
            logger.error(f"Error while getting file from S3 bucket: {ex}")
            raise ValueError(ex)
