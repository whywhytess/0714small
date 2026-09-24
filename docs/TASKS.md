# 任务板

按工作计划 v2.1 第 6 节整理。每项完成时勾选，并在当天的 devlog 里附上证据。Gate 未通过时后续任务顺延。

图例：`[x]` 完成 · `[~]` 进行中 · `[ ]` 未开始 · `[!]` 阻塞

## W0 — 新仓库、范围与开发基础

**Gate**：仓库可独立运行；MVP 范围、接口约定、CI 和安全规则已记录。

- [x] **D1** 新建仓库、README、任务板、分支规则；MVP Scope Freeze v1 草案
  - [x] 旧项目密钥检查：git 全历史 gitleaks 没有发现泄露；`.env` 从未提交，外部服务密钥均为空；未提交的 PDF 没有问题
- [x] **D2** ADR 0001–0007；最小威胁表（`docs/security/threat-model.md`）
  - [!] ADR 0007 里的供应商、PITR、预算需要本人决定
- [x] **D3** `apps/web`、`apps/gateway`、`packages/db`、`packages/contracts`；Compose（PostgreSQL / RustFS / Mailpit）与 `.env.example`；空库迁移和冒烟测试通过
- [x] **D4** CI workflow（密钥扫描、TS、Go、集成）、PR 模板
  - [x] 推送后在 GitHub 上跑通 CI
  - [x] main 分支保护（`docs/runbooks/github-setup.md`）
  - [x] 验证失败的构建不能合并（PR #2：lint 失败 → BLOCKED，已关闭）
- [~] **D5** Staging 方案、备份目标、事故回滚 runbook、法律核查清单
  - [x] 第一条 PR 经本人 review 后合并
  - [ ] 本人审阅 W0 全部文档（Scope Freeze、ADR 状态改为“接受”）
  - [!] ADR 0007 待决项：托管 PostgreSQL、运行平台、邮件、地域、预算、恢复目标

## W1 — 注册、认证、Session

**Gate**：两个浏览器会话都能验证注册、登录、登出、找回和撤销。

- [ ] D1 users/sessions/email_tokens 迁移、约束、过期、封禁；授权 helper
- [ ] D2 注册与邮箱验证；失败响应不泄露账号是否存在
- [ ] D3 登录/登出、找回密码、token hash、过期；cookie 只发在控制面域
- [ ] D4 写请求的登录、Origin/CSRF 校验；登录/注册限流；封禁检查
- [ ] D5 真实浏览器全流程；日志中无明文 Token；Auth 审查

## W2 — 站点与草稿文件

**Gate**：站主能管理自己的站点和单个文件；跨站访问全部被拒绝。

- [ ] D1 sites、draft_files、对象引用与配额模型；slug/保留词/owner_id 校验
- [ ] D2 创建/读取站点、软删除；路径规范化函数与测试向量
- [ ] D3 单文件上传/下载/新建/删除；先写对象再记账
- [ ] D4 更新与 If-Match 冲突（409）；配额；按 site_id 授权
- [ ] D5 孤儿对象清理、软删除恢复窗口、存储故障测试

## W3 — 独立静态 Gateway

**Gate**：发布测试部署后，能通过用户站点域读取静态文件。

- [ ] D1 仅 GET/HEAD 的 Go Gateway；只读 DB 与对象权限；Host 解析
- [ ] D2 index、404、MIME、nosniff、流式读取；缓存 TTL
- [ ] D3 测试部署清单与发布指针；本地多 Host 测试
- [ ] D4 两个注册域；wildcard DNS/TLS；cookie 与跨源边界
- [ ] D5 非法路径、停库/停存储故障；缓存上限与 503 行为

## W4 — 文件管理器与编辑器

**Gate**：站主能编辑并安全保存文件，能浏览已发布的网站。

- [ ] D1 文件列表/创建/上传/删除/下载 UI；配额与失败原因
- [ ] D2 Monaco；语法高亮；未保存提示
- [ ] D3 If-Match/etag 保存；冲突时让用户选择重载或另存
- [ ] D4 大文件与上传异常限制；不注入用户代码；在新窗口预览已发布站点
- [ ] D5 移动端、无障碍、主流程手工验收

## W5 — 原子发布、回滚与缓存 → **M1**

**Gate**：已发布版本始终完整；发布失败后旧版本仍然可用。

- [ ] D1 deployments、deployment_files、operation_id；站点级串行
- [ ] D2 构建清单、验证对象；在事务中切换 current_deployment_id
- [ ] D3 历史列表、回滚、软删除对 Gateway 的可见性、审计
- [ ] D4 真实测试域实测 CDN/浏览器缓存
- [ ] D5 端到端：创建 → 保存 → 发布 → 子域访问 → 回滚

## W6 — Explore、标签与 Follow

**Gate**：公开站点可以被发现，关注关系数据准确。

- [ ] D1 可见性状态；Explore 只查 public 且已发布的站点
- [ ] D2 标题/简介/标签/排序/分页；输出转义
- [ ] D3 Follow/Unfollow、Followers/Following；唯一索引
- [ ] D4 举报入口、刷页限制、纯色站点卡片
- [ ] D5 公开/隐藏/封禁状态与发现结果的一致性

## W7 — 运营与邀请测试候选 → **M2**

**Gate**：可以安全地邀请小批用户，并能处理故障。

- [ ] D1 Admin：查找、暂停、恢复，每项操作写 audit_event
- [ ] D2 配额与防机器人策略；后台开关
- [ ] D3 自动备份；在隔离环境做一次恢复演练
- [ ] D4 健康检查、告警、runbook；条款/隐私/AUP/举报/删除流程
- [ ] D5 第 9 节 Gate 全部验收；打邀请测试候选标签

## W8 — 封闭试用

- [ ] D1 发放邀请，建立反馈与举报渠道
- [ ] D2 观察错误率、发布延迟、成本；找出前三个问题
- [ ] D3 修复阻断缺陷；跨租户回归
- [ ] D4 非开发者试用编辑器；改进文案
- [ ] D5 复核事故、恢复、举报处理和成本

## W9 — 分批开放与下一阶段决策

- [ ] D1 复核条款、隐私、删除流程和预算
- [ ] D2 分批用户上限、暂停注册开关、负载测试
- [ ] D3 演练停止注册、站点暂停、恢复旧版本、备份恢复
- [ ] D4 向下一批用户开放并观察
- [ ] D5 根据真实需求挑选 V2 功能
