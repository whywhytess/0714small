# 架构决策记录（ADR）

每个 ADR 记录一个决策：背景、决定、后果和被否决的方案。旧项目的 ADR 只作设计参考，不自动约束本仓库。

## 状态

- **提议**：已写好，等待本人审阅
- **接受**：已审阅，是当前约束
- **取代**：被后续 ADR 替换（注明编号）

修改已接受的 ADR 时，新写一个 ADR 取代它，不直接改写原文。

## 索引

| 编号 | 标题 | 状态 |
|---|---|---|
| [0001](0001-domain-isolation.md) | 控制面与用户站点使用不同注册域 | 提议 |
| [0002](0002-site-id-and-object-keys.md) | 不可变 site_id 与对象键 | 提议 |
| [0003](0003-go-static-gateway.md) | 独立 Go 静态 Gateway | 提议 |
| [0004](0004-postgres-sessions-and-jobs.md) | Session 与后台任务用 PostgreSQL，不用 Redis | 提议 |
| [0005](0005-s3-object-storage.md) | 私有 S3 兼容对象存储 | 提议 |
| [0006](0006-immutable-deployments.md) | 不可变部署清单与原子切换 | 提议 |
| [0007](0007-providers-and-environments.md) | 供应商与环境划分 | 提议（部分待决） |

## 模板

```markdown
# NNNN. 标题

- 状态：提议
- 日期：YYYY-MM-DD

## 背景
## 决定
## 后果
## 被否决的方案
```
