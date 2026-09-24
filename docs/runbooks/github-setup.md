# GitHub 仓库设置

仓库：`whywhytess/0714small`（**公开**，任何提交的内容都能被所有人看到）。

这些操作会改变远程仓库的设置，只由本人执行，或者由本人确认后让 AI 执行。

## 1. 首次推送

```sh
git push -u origin main
```

## 2. main 分支保护

前提：`main` 已存在于远程仓库。

```sh
gh api -X PUT repos/whywhytess/0714small/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Secret scan",
      "TS lint / typecheck / unit / build",
      "Go lint / test / build",
      "DB / storage integration"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "restrictions": null
}
JSON
```

说明：

- `contexts` 必须与 `.github/workflows/ci.yml` 里各 job 的 `name` 完全一致；改 job 名时要同步修改这里。
- 单人项目没法批准自己的 PR，所以 `required_approving_review_count` 设为 0。“本人审阅”靠 PR 流程和模板中的检查项来保证；`enforce_admins: true` 让仓库所有者也不能直接推送到 main。
- `strict: true`：分支必须基于最新的 main，CI 通过后才能合并。

验证：

```sh
gh api repos/whywhytess/0714small/branches/main/protection --jq '.required_status_checks.contexts'
```

## 3. 仓库安全设置

```sh
# 开启 secret scanning 与 push protection（公开仓库免费）
gh api -X PATCH repos/whywhytess/0714small --input - <<'JSON'
{
  "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" }
  },
  "delete_branch_on_merge": true,
  "allow_merge_commit": false,
  "allow_rebase_merge": false,
  "allow_squash_merge": true
}
JSON

# Dependabot 安全告警
gh api -X PUT repos/whywhytess/0714small/vulnerability-alerts
```

## 4. 验收：失败的构建不能合并

1. 新建分支，故意引入一个 lint 错误，然后开 PR。
2. 确认 CI 失败，并且 PR 页面的合并按钮不可用。
3. 关闭这个 PR，删除分支。
