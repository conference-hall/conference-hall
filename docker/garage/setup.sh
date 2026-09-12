#!/bin/sh

set -eu

ADMIN_URL="http://garage:3903"

setup_bucket() {
  bucket=$1

  # Create the bucket, ignoring the 409 BucketAlreadyExists answered on replays.
  curl -s -o /dev/null -X POST "$ADMIN_URL/v2/CreateBucket" \
    -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{\"globalAlias\":\"$bucket\"}"

  # Read back the bucket id, the only form the permission endpoint accepts.
  bucket_id=$(curl -sf -G "$ADMIN_URL/v2/GetBucketInfo" \
    --data-urlencode "globalAlias=$bucket" \
    -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
    | sed -n 's/.*"id": "\([0-9a-f]*\)".*/\1/p' | head -n 1)

  # Grant the S3 access key full rights on the bucket.
  curl -sf -o /dev/null -X POST "$ADMIN_URL/v2/AllowBucketKey" \
    -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{\"bucketId\":\"$bucket_id\",\"accessKeyId\":\"$GARAGE_ACCESS_KEY_ID\",\"permissions\":{\"read\":true,\"write\":true,\"owner\":true}}"

  echo "Bucket $bucket ready"
}

setup_bucket conference-hall
setup_bucket conference-hall-test
