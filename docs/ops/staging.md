# Staging 方案

- 日期：2026-09-24（W0 Day 5）
- 依据：计划第 8 节；[ADR 0007](../adr/0007-providers-and-environments.md)

## 原则

1. **完全隔离**：staging 有自己的数据库实例、对象存储桶、域名和凭据，与生产没有任何共享。
2. **与生产的约定相同**：发布流程、Gateway 权限（只读 DB 角色、只读 S3 凭据）、Cookie 与域名隔离方式，都和生产保持一致。
3. **只放匿名的样例数据**，绝不导入生产数据。
4. **先备份再迁移**：在 staging 执行新迁移前先做快照；staging 同时也是生产迁移的彩排。

## 资源清单（供应商确定后填写）

| 资源 | Staging | 生产 | 备注 |
|---|---|---|---|
| 控制面域名 | `app.<staging 控制面域>` | `app.<控制面域>` | 两个环境各需要一对不同的注册域（ADR 0001） |
| 站点域名 | `*.<staging 站点域>` | `*.<站点域>` | wildcard DNS/TLS，W3 Day 4 验证 |
| PostgreSQL | 独立实例 | 独立实例 | 供应商待定；需要 PITR 和只读角色 |
| 数据库角色 | `app`、`gateway`（∈ `gateway_ro`） | 同左 | 创建方法见下文 |
| S3 桶 | `small0714-staging-sites` | `small0714-prod-sites` | 私有，开启 Block Public Access 和 Versioning |
| S3 凭据 | web 读写 / gateway 只读 / 备份专用 | 同左 | 三套互相独立 |
| 邮件 | 沙箱或测试收件地址 | 正式发件域 | 发件域需配置 SPF / DKIM / DMARC |
| 运行平台 | 待定 | 待定 | ADR 0007 |

## 数据库角色创建（staging / 生产）

由本人用管理员账户执行一次；密码存放在平台的密钥管理里，不写进仓库：

```sql
CREATE ROLE app LOGIN PASSWORD '<从密钥管理生成>';
CREATE ROLE gateway_ro NOLOGIN;
CREATE ROLE gateway LOGIN PASSWORD '<从密钥管理生成>' IN ROLE gateway_ro;
ALTER DATABASE <db> OWNER TO app;
ALTER SCHEMA public OWNER TO app;
REVOKE ALL ON DATABASE <db> FROM PUBLIC;
GRANT CONNECT ON DATABASE <db> TO app, gateway;
```

之后用 `app` 账户运行 `pnpm db:migrate`。

## 部署流程（W1 起启用）

1. PR 合并到 `main`，CI 通过
2. 部署到 staging（启用前由本人手动触发）
3. 在 staging 上跑冒烟测试，并走一遍关键路径
4. 由本人手动推广到生产

## 待决

- [ ] 托管 PostgreSQL 与运行平台的供应商（ADR 0007）
- [ ] 两对域名（staging、生产）
- [ ] staging 月度预算上限
