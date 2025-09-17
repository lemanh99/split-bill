#!/bin/bash

$CMD_MC alias set billfaster http://$MINIO_HOST:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD;

# Setup user & acccess policy
$CMD_MC admin user add billfaster $ACCESS_KEY $SECRET_ACCESS_KEY
$CMD_MC admin policy create billfaster billfaster-development $POLICY_FILE
$CMD_MC admin policy attach billfaster billfaster-development --user $ACCESS_KEY

# Create buckets
$CMD_MC mb billfaster/$BUCKET_NAME --with-versioning --ignore-existing

$CMD_MC mb billfaster/$PUBLIC_BUCKET_NAME --with-versioning --ignore-existing
$CMD_MC anonymous set download billfaster/$PUBLIC_BUCKET_NAME

$CMD_MC mb billfaster/$BUCKET_TESTING_NAME --with-versioning --ignore-existing
