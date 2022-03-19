FROM alpine

RUN apk add --no-cache postgresql-client gzip aws-cli

ENV PGHOST localhost
ENV PGPORT 5432
ENV PGDATABASE database
ENV PGUSER admin
ENV PGPASSWORD password
ENV S3_BUCKET_NAME bucketName
ENV S3_ENDPOINT_URL http://s3:9000
ENV AWS_ACCESS_KEY_ID root
ENV AWS_SECRET_ACCESS_KEY password

WORKDIR /
COPY . .
ENTRYPOINT ["/backup.sh"]
