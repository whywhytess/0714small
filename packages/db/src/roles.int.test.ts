import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runMigrations } from "./migrate.ts";

// 默认值与 infra/compose 一致；CI 使用同一套 Compose。
const APP_URL =
  process.env.DATABASE_URL ?? "postgres://app:app_dev_password@localhost:55432/small0714";
const GATEWAY_URL =
  process.env.GATEWAY_DATABASE_URL ??
  "postgres://gateway:gateway_dev_password@localhost:55432/small0714";

describe("数据库角色边界（ADR 0003 / 威胁表 T12）", () => {
  const app = postgres(APP_URL, { max: 1, onnotice: () => {} });
  const gateway = postgres(GATEWAY_URL, { max: 1 });

  beforeAll(async () => {
    await runMigrations(APP_URL);
    // 迁移可重复执行
    await runMigrations(APP_URL);
  });

  afterAll(async () => {
    await app`DROP TABLE IF EXISTS public.__role_probe`;
    await Promise.all([app.end(), gateway.end()]);
  });

  it("gateway 只继承 gateway_ro，不是超级用户，也不能建角色或建库", async () => {
    const [row] = await gateway`
      SELECT rolsuper, rolcreaterole, rolcreatedb,
             pg_has_role(current_user, 'gateway_ro', 'MEMBER') AS in_ro
      FROM pg_roles WHERE rolname = current_user`;
    expect(row).toEqual({ rolsuper: false, rolcreaterole: false, rolcreatedb: false, in_ro: true });
  });

  it("gateway 不能在 public schema 建表", async () => {
    await expect(gateway`CREATE TABLE public.gw_should_fail (id int)`).rejects.toThrow(
      /permission denied/,
    );
  });

  it("app 新建的表默认对 gateway 不可读（必须逐表授权）", async () => {
    await app`CREATE TABLE IF NOT EXISTS public.__role_probe (id int)`;
    await expect(gateway`SELECT * FROM public.__role_probe`).rejects.toThrow(/permission denied/);
  });

  it("gateway 读不到迁移记录", async () => {
    await expect(gateway`SELECT * FROM drizzle.__drizzle_migrations`).rejects.toThrow(
      /permission denied/,
    );
  });
});
