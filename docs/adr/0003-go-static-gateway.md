# 0003. 独立 Go 静态 Gateway

- 状态：提议
- 日期：2026-09-24

## 背景

用户站点的流量模式（大量小文件的 GET、流式传输、简单路由）与控制面（带认证的读写 API、页面渲染）完全不同。两者放在同一个进程里，站点流量会拖慢控制面，控制面的漏洞也会直接暴露给站点域。

## 决定

1. `apps/gateway` 是独立的 Go 服务，只使用标准库加少量必要依赖（PostgreSQL 驱动、S3 客户端）。
2. 只接受 `GET` 和 `HEAD`，其他方法返回 `405`。
3. 请求流程：
   1. 校验 Host → 得到 slug（ADR 0001）
   2. 规范化路径（与 TS 共用测试向量）
   3. 用**只读数据库账户**查站点状态和 `current_deployment_id`
   4. 在该部署的 `deployment_files` 里查路径
   5. 从对象存储流式读取并返回
4. 最小权限：
   - 数据库：登录用户 `gateway` 只继承角色 `gateway_ro`；只对 `sites`、`deployments`、`deployment_files` 授予 `SELECT`，**不授予** `users`、`sessions` 等表的权限。
   - 对象存储：只读凭据，没有写入和删除权限。
5. 健康检查、指标放在**单独的端口**，不挂在站点域的路径下，避免和用户文件冲突。
6. 响应头：正确的 `Content-Type`；`X-Content-Type-Options: nosniff`；未知类型用 `application/octet-stream` 并加 `Content-Disposition: attachment`；缓存 TTL 在 W3 Day 2 确定。
7. 数据库不可用时：没有缓存的请求返回 `503`，绝不回退到其他站点的内容。

## 后果

- 需要维护两种语言。靠 `packages/contracts` 里文档化的约定和共享测试向量来保证两边行为一致，**不移植** TS 代码。
- Go 静态二进制容器小、冷启动快，内存占用可预测。

## 被否决的方案

- **用 Next.js 同一个服务提供站点**：隔离差，资源互相争抢。
- **Node/TS 独立进程**（v2.0 的方案）：可以复用代码，但 v2.1 选择了 Go，理由是性能和运行成本；代价是必须维护共享测试向量。
- **只用 CDN 或对象存储的静态网站功能**：做不到原子切换、按站点暂停和 Host 规则。
