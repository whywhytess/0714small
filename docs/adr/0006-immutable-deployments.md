# 0006. 不可变部署清单与原子切换

- 状态：提议
- 日期：2026-09-24

## 背景

发布必须满足：访问者只会看到**旧的完整版本或新的完整版本**，不会看到一半新一半旧的状态；发布失败时旧版本继续在线；可以回滚到任何仍在保留期内的版本。

## 决定

### 数据

- `deployments(id, site_id, state, operation_id, created_by, created_at, ready_at)`
  - `state ∈ {PREPARING, READY, FAILED}`
  - `UNIQUE(site_id, operation_id)`：客户端为每次点击“发布”生成一个 `operation_id`，重复提交得到同一个结果
- `deployment_files(site_id, deployment_id, path, object_key, size, mime)`
  - `UNIQUE(deployment_id, path)`
  - 创建后**不可修改**（应用层不提供 UPDATE；数据库层用触发器或权限来保证）
- `sites.current_deployment_id` 只能指向**同一站点**的 `READY` 部署（用外键加检查来保证）

### 发布流程（同步完成）

1. 获取站点级锁（`SELECT … FROM sites WHERE id = $1 FOR UPDATE` 或 advisory lock），同一站点的发布串行执行。
2. 按 `operation_id` 去重。
3. 插入一条 `PREPARING` 状态的部署；读取草稿快照，写入 `deployment_files`。
4. 逐项校验：对象存在（`HeadObject`），总大小和文件数在配额内。
5. 在**同一个事务**里：把部署标记为 `READY`，并更新 `sites.current_deployment_id`。
6. 任何一步失败：部署标记为 `FAILED`，`current_deployment_id` 不变。

### 回滚

- 在事务里把 `current_deployment_id` 改回一个仍在保留期内的 `READY` 部署，并写审计记录。
- 执行前先确认目标部署的对象都还在；有缺失就拒绝回滚并告警。

### 缓存

- URL 里不带部署 ID，所以切换版本后 CDN 和浏览器可能继续使用旧缓存。HTML 首版禁用共享缓存或只给很短的 TTL；其他资源使用明确的短 TTL。W5 Day 4 实测最大过期时间，**不假设切换指针就能清掉缓存**。

## 后果

- 发布不复制对象（ADR 0002），耗时与文件数量成正比。
- 保留多少个部署、保留多久，直接影响存储量和清理规则。在 W5 确定，初步建议“最近 10 个或 30 天”。
- Gateway 每次请求要多查一次清单，性能不够时再加有边界的缓存。

## 被否决的方案

- **直接改写线上目录**：会出现半新半旧的状态，也没法回滚。
- **异步队列发布**：多了一个会出故障的地方；MVP 规模下同步发布就够了。
