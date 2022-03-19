#!/bin/sh
set -e

while true
do
    pg_dumpall | gzip > ./compressed_dump
    aws --endpoint-url "$S3_ENDPOINT_URL" s3api put-object \
        --bucket "$S3_BUCKET_NAME" \
        --key backup.gz \
        --body ./compressed_dump
    sleep 43200 # 12 hours
done
