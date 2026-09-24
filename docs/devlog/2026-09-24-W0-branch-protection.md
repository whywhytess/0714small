# 2026-09-24 · W0 Day 4 收尾 · 分支保护与验证

## 已配置（`whywhytess/0714small`）

按 `docs/runbooks/github-setup.md` 配置，并通过 API 读回确认：

| 设置 | 值 |
|---|---|
| 必须通过的 check | Secret scan、TS lint / typecheck / unit / build、Go lint / test / build、DB / storage integration |
| 分支必须基于最新 main（strict） | 是 |
| 对管理员同样生效（enforce_admins） | 是 |
| 必须通过 PR 合并 | 是（需要的批准数为 0，因为是单人项目） |
| 线性历史 | 是 |
| 禁止强制推送和删除分支 | 是 |
| 必须解决所有评论 | 是 |
| 合并方式 | 只允许 squash；合并后自动删除分支 |
| Secret scanning 和 push protection | 已开启 |
| Dependabot 安全告警 | 已开启 |

## 验证：失败的构建不能合并

- PR #2（`feature/W0-03-verify-branch-protection`）在 `packages/contracts/src/states.ts` 里故意加了一个未使用的变量
- CI 结果：`TS lint / typecheck / unit / build` 失败（`'intentionallyUnused' is assigned a value but never used`），其他 3 个 check 通过
- GitHub 的合并状态是 **`BLOCKED`**，符合预期
- 已关闭 PR #2（没有合并）并删除分支；main 不受影响

没有尝试直接推送到 main，也没有用管理员权限强行合并：两者都有可能真的改动 main。这两条规则由 `enforce_admins: true` 和读回的保护配置保证。

## W0 Gate 状态

| 条件 | 状态 |
|---|---|
| 仓库可以独立运行 | ✅ CI 在干净的 runner 上从零跑通，包括空数据库迁移、存储初始化和冒烟测试 |
| MVP 范围、接口约定、安全规则已记录 | ✅ 草案完成；⏳ 等待本人审阅后把状态改为“接受” |
| CI 与分支保护 | ✅ |
| 第一条 PR 经本人 review | ✅ |

## 下一步

- 本人审阅 Scope Freeze 和 ADR 0001–0007，确定 ADR 0007 的待决项
- 开始 W1 Day 1：users、sessions、email_tokens 的迁移和授权 helper
