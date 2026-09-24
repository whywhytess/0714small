// 本地 / CI：确保私有桶存在并开启版本控制（ADR 0005）。staging/生产的桶由本人在云端创建。
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketVersioningCommand,
} from "@aws-sdk/client-s3";
import { s3FromEnv } from "./s3.ts";

const { client, bucket } = s3FromEnv();

try {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log(`bucket ${bucket} exists`);
} catch {
  await client.send(new CreateBucketCommand({ Bucket: bucket }));
  console.log(`bucket ${bucket} created`);
}

await client.send(
  new PutBucketVersioningCommand({
    Bucket: bucket,
    VersioningConfiguration: { Status: "Enabled" },
  }),
);
console.log(`bucket ${bucket} versioning enabled`);
