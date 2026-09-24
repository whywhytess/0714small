// W0 冒烟测试：数据库（app / gateway 两个账户）、迁移状态、对象存储读写、邮件接收器。
// 前置：pnpm infra:up && pnpm infra:init
import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetBucketVersioningCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import postgres from "postgres";
import { s3FromEnv } from "./s3.ts";

const APP_URL =
  process.env.DATABASE_URL ?? "postgres://app:app_dev_password@localhost:55432/small0714";
const GATEWAY_URL =
  process.env.GATEWAY_DATABASE_URL ??
  "postgres://gateway:gateway_dev_password@localhost:55432/small0714";

let failed = false;
async function check(name: string, fn: () => Promise<string>) {
  try {
    console.log(`ok   ${name}: ${await fn()}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${name}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

await check("postgres (app)", async () => {
  const sql = postgres(APP_URL, { max: 1 });
  try {
    const [row] = await sql`SELECT current_user AS u, current_setting('server_version') AS v`;
    const [mig] = await sql`SELECT count(*)::int AS n FROM drizzle.__drizzle_migrations`;
    return `user=${row?.u} server=${row?.v} migrations=${mig?.n}`;
  } finally {
    await sql.end();
  }
});

await check("postgres (gateway, read-only)", async () => {
  const sql = postgres(GATEWAY_URL, { max: 1 });
  try {
    const [row] = await sql`SELECT current_user AS u, pg_has_role(current_user, 'gateway_ro', 'MEMBER') AS ro`;
    if (!row?.ro) throw new Error("gateway is not a member of gateway_ro");
    return `user=${row.u} member_of=gateway_ro`;
  } finally {
    await sql.end();
  }
});

await check("object storage round-trip", async () => {
  const { client, bucket } = s3FromEnv();
  const key = `smoke/${randomUUID()}`;
  const body = `smoke ${new Date().toISOString()}`;
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
  const got = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const text = await got.Body?.transformToString();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  if (text !== body) throw new Error("read-back mismatch");
  const v = await client.send(new GetBucketVersioningCommand({ Bucket: bucket }));
  return `bucket=${bucket} put/get/delete ok, versioning=${v.Status ?? "off"}`;
});

await check("mail catcher", async () => {
  const res = await fetch("http://localhost:8025/readyz");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return "mailpit ready";
});

process.exit(failed ? 1 : 0);
