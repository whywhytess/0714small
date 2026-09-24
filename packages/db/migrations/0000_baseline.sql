-- Baseline：Gateway 只读角色与 public schema 权限（ADR 0003，威胁表 T12）。
-- 本地/CI 由 infra/compose/postgres/init-roles.sh 预先创建角色；
-- staging/生产由本人按 runbook 创建 gateway 登录用户并 GRANT gateway_ro。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gateway_ro') THEN
    CREATE ROLE gateway_ro NOLOGIN;
  END IF;
END
$$;
--> statement-breakpoint
-- 默认情况下 PUBLIC 对 public schema 有 USAGE；收回后只有明确授权的角色能访问。
REVOKE ALL ON SCHEMA public FROM PUBLIC;
--> statement-breakpoint
-- 只授予 USAGE，不使用 ALTER DEFAULT PRIVILEGES：
-- 每张允许 Gateway 读取的表都必须在它自己的迁移里显式 GRANT SELECT。
GRANT USAGE ON SCHEMA public TO gateway_ro;
