#!/bin/sh
# 首次初始化数据卷时由 postgres 镜像执行（以超级用户身份）。
# 角色划分见 ADR 0003：
#   app        — 控制面，数据库和 public schema 的所有者，负责运行迁移
#   gateway_ro — 只读权限的集合角色（NOLOGIN），具体表的 SELECT 由迁移逐表授予
#   gateway    — Gateway 的登录用户，只继承 gateway_ro
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v app_pw="$APP_DB_PASSWORD" -v gw_pw="$GATEWAY_DB_PASSWORD" <<'SQL'
CREATE ROLE app LOGIN PASSWORD :'app_pw';
CREATE ROLE gateway_ro NOLOGIN;
CREATE ROLE gateway LOGIN PASSWORD :'gw_pw' IN ROLE gateway_ro;

ALTER DATABASE small0714 OWNER TO app;
ALTER SCHEMA public OWNER TO app;

REVOKE ALL ON DATABASE small0714 FROM PUBLIC;
GRANT CONNECT ON DATABASE small0714 TO app, gateway;
SQL
