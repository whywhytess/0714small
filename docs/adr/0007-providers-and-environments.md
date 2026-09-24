# 0007. 供应商与环境划分

- 状态：提议（**部分待决**，标记为「待本人决定」的项目确定后改为“接受”）
- 日期：2026-09-24

## 背景

计划要求在 W0 明确供应商选择、环境隔离、PITR 目标和预算上限。本 ADR 记录已经能确定的部分，其余标注为待决，不凭空替用户决定。

## 决定

### 环境

| 环境 | 数据库 | 对象存储 | 域名 | 凭据 |
|---|---|---|---|---|
| Local | Compose PostgreSQL | Compose MinIO | `*.localhost` / hosts 文件 | `.env`（不提交） |
| CI | Compose PostgreSQL | Compose MinIO | 不需要 | CI 临时生成 |
| Staging | 独立的托管 PostgreSQL 实例 | 独立的桶 | 独立的一对测试域名 | 独立凭据，与生产不共用 |
| Production | 托管 PostgreSQL | 私有 S3 桶（开启版本控制） | 正式的一对域名 | 只有本人能操作 |

规则：

- 任何环境之间都不共享数据库、桶或凭据。
- staging 只使用匿名的样例数据，不导入生产数据。
- 生产部署、密钥、域名、备份操作只由本人执行（计划第 5 节）。

### 供应商

| 组件 | 选择 | 状态 |
|---|---|---|
| DNS / TLS / WAF | Cloudflare | 接受（计划已指定） |
| 对象存储 | AWS S3 | 接受（计划“暂选”） |
| 托管 PostgreSQL | 候选：AWS RDS、Neon、Supabase、Crunchy Bridge | **待本人决定** |
| Web/API 与 Gateway 运行平台 | 候选：Fly.io、Render、AWS ECS/App Runner、单台 VPS + Docker | **待本人决定** |
| 事务邮件 | 候选：Amazon SES、Postmark、Resend | **待本人决定** |
| 地域 | 应与目标用户和运营地点一致 | **待本人决定** |

选择托管 PostgreSQL 时必须满足：支持 PITR、可以在隔离环境恢复、能创建只读角色、PostgreSQL 16 或更高版本。

### 恢复目标（建议值，待本人确认）

| 指标 | 建议值 |
|---|---|
| PostgreSQL PITR 窗口 | 7 天 |
| RPO（最多丢失的数据） | ≤ 15 分钟 |
| RTO（恢复服务的时间） | ≤ 4 小时（单人值守） |
| S3 非当前版本保留期 | 30 天 |
| 部署保留 | 每个站点最近 10 个或 30 天内的部署 |

### 预算上限

**待本人决定**：分别写出 staging 和生产的月度上限。W7 用实际对象量和请求量重新估算。

## 后果

- W0 Day 5 前需要填完上面的待决项，否则 W1 起的 staging 部署会被阻塞。
- 原来的 AWS 全层 Multi-AZ 估算只作为扩容参考，不写成已实现的能力。
