# 0004. Session 与后台任务用 PostgreSQL，不用 Redis

- 状态：提议
- 日期：2026-09-24

## 背景

MVP 阶段的用户量很小，瓶颈不在 Session 查询。多一个 Redis 就多一套需要部署、备份、监控和做故障处理的系统，而一人团队的运维预算有限。

## 决定

### Session

- 表 `sessions(id, user_id, token_hash, created_at, expires_at, revoked_at, last_seen_at)`。
- token 用 CSPRNG 生成（≥ 256 位），只发给浏览器一次；数据库只存 `SHA-256(token)`。
- 每次请求都在一次查询里同时检查 session 是否有效（未过期、未撤销）和用户状态（未暂停）。
- 登出时撤销当前 session；改密码或被封禁时撤销该用户的全部 session。
- `last_seen_at` 最多每几分钟更新一次，避免每个请求都写库。

### 后台任务

- 表 `jobs(id, kind, payload, idempotency_key UNIQUE, run_after, attempts, max_attempts, locked_at, last_error)`。
- 单个 worker 用 `SELECT … FOR UPDATE SKIP LOCKED` 领取任务。
- 只在真正需要时使用（邮件重试、孤儿对象清理）。**发布不走任务队列**，而是同步完成（ADR 0006）。
- worker 挂掉不能影响已发布站点。

### 限流

- 登录、注册、找回密码的限流先放在 PostgreSQL（按 IP 和账号的计数窗口）；边界层的限流交给 Cloudflare。

## 后果

- 本地和 CI 只需要 PostgreSQL 和一个 S3 兼容存储。
- 高并发时 session 查询会压到数据库上。触发条件（计划第 8 节「增长信号」）出现后再评估缓存或 Redis，届时需要新写 ADR。

## 被否决的方案

- **Redis 存 Session**：MVP 用不上它的性能，却要付出运维和恢复的成本。
- **无状态 JWT**：无法立即撤销，与“登出、改密、封禁后立即失效”的要求冲突。
