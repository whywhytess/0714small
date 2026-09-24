import { S3Client } from "@aws-sdk/client-s3";

export function s3FromEnv(): { client: S3Client; bucket: string } {
  const env = (name: string, fallback: string) => process.env[name] ?? fallback;
  const client = new S3Client({
    endpoint: env("S3_ENDPOINT", "http://localhost:59000"),
    region: env("S3_REGION", "us-east-1"),
    forcePathStyle: env("S3_FORCE_PATH_STYLE", "true") === "true",
    credentials: {
      accessKeyId: env("S3_ACCESS_KEY_ID", "minio_dev"),
      secretAccessKey: env("S3_SECRET_ACCESS_KEY", "minio_dev_password"),
    },
  });
  return { client, bucket: env("S3_BUCKET", "small0714-sites") };
}
