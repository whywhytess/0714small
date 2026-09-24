# small0714

一个静态网站托管平台（功能参考 Nekoweb）。用户注册后创建站点，在线编辑或上传 HTML/CSS/JS，原子发布到独立子域，并可在 Explore 中被发现和 Follow。

> **状态：W0（新仓库与开发基础）完成，等待本人审阅**。控制面和 Gateway 目前只是骨架；功能从 W1（认证）开始。

## 首发目标

注册 → 创建站点 → 编辑/上传 HTML/CSS/JS → 原子发布 → 独立子域访问 → Explore → Follow。

首轮邀请测试以**安全、可恢复的核心流程**为门槛；高级功能在用户反馈后排期。完整范围见 [MVP Scope Freeze v1](docs/scope/mvp-scope-freeze-v1.md)。

## 架构（计划）

```
app.example.com  ──►  apps/web       Next.js 控制面（页面 + API），读写 PostgreSQL / S3
*.sites-example.net ─► apps/gateway  Go 静态 Gateway，仅 GET/HEAD，只读 DB + 只读对象
                        │
                        ├─ PostgreSQL（用户、Session、站点、草稿、部署清单、关注、审计、jobs）
                        └─ S3 私有桶（本地为 RustFS）
```

- 控制面与用户站点使用**不同注册域**；用户代码只在站点域运行，读不到控制面 Cookie。
- 不运行用户服务端代码，不执行构建命令。
- 不使用 Redis；Session 与后台任务使用 PostgreSQL。

## 仓库结构

| 路径 | 用途 |
|---|---|
| `apps/web` | Next.js App Router + TypeScript 控制面 |
| `apps/gateway` | Go 静态 Gateway |
| `packages/db` | Drizzle Schema 与迁移 |
| `packages/contracts` | 跨服务数据结构、API 约定与共享测试向量 |
| `infra/compose` | 本地 PostgreSQL / S3 兼容存储（RustFS）/ 测试邮件 |
| `docs/scope` | 范围冻结 |
| `docs/adr` | 架构决策记录 |
| `docs/devlog` | 每日开发记录 |
| `docs/runbooks` | 运维与事故处理 |
| `docs/plan` | 工作计划原文（PDF） |

未进入 MVP 的功能（SSI、截图、RSS、Git 等）**不建空目录**。

## 文档

| 类别 | 文档 |
|---|---|
| 计划与范围 | [工作计划 v2.1（PDF）](docs/plan/) · [MVP Scope Freeze v1](docs/scope/mvp-scope-freeze-v1.md) · [任务板](docs/TASKS.md) · [法律核查清单](docs/scope/legal-checklist.md) |
| 架构 | [ADR 索引](docs/adr/README.md) · [威胁表](docs/security/threat-model.md) · [共享约定](packages/contracts/README.md) |
| 运维 | [Staging 方案](docs/ops/staging.md) · [备份与恢复](docs/ops/backup-and-recovery.md) · [事故与回滚](docs/runbooks/incident-and-rollback.md) · [GitHub 设置](docs/runbooks/github-setup.md) |
| 流程 | [分支与 PR 规则](CONTRIBUTING.md) · [开发日志](docs/devlog/) |

## 本地开发

### 依赖

| 工具 | 版本 |
|---|---|
| Node.js | ≥ 24（CI 使用 `.node-version`） |
| pnpm | 12.x（由 `packageManager` 字段固定） |
| Go | 见 `apps/gateway/go.mod` |
| Docker | 带 Compose v2 |

### 启动

```sh
cp .env.example .env        # 本地开发用的示例值
pnpm install
pnpm infra:up               # PostgreSQL :55432 · S3（RustFS）:59000（控制台 :59001）· Mailpit :8025
pnpm infra:init             # 运行迁移 + 创建存储桶（开启版本控制）
pnpm smoke                  # 检查数据库、只读角色、对象存储、邮件
```

端口避开了 5432 和 9000，以免与本机其他项目冲突。

```sh
pnpm dev                                 # 控制面 http://localhost:3000
cd apps/gateway && make run              # Gateway :8080，健康检查 127.0.0.1:8081/healthz
```

### 检查（与 CI 相同）

```sh
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm test:integration                    # 需要先 infra:up
cd apps/gateway && make lint test build
pnpm secrets:scan                        # gitleaks 扫描 git 历史
```

### 清理

```sh
pnpm infra:down     # 停止服务，保留数据
pnpm infra:reset    # 停止服务并删除数据卷
```

### 本地域名

浏览器会把 `*.localhost` 解析到 127.0.0.1，所以本地可以用 `app.localhost:3000` 和 `<slug>.sites.localhost:8080` 模拟两个域。但它们同属 `localhost`，**不能用来验证跨注册域隔离**；这项验证在 W3 Day 4 用真实测试域完成。

## 许可与品牌

产品名称、Logo、默认视觉与文案自行设计；“Nekoweb-like”仅表示功能参考，不使用他人商标或视觉素材。
