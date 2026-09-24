# @small0714/contracts

控制面（TypeScript）和 Gateway（Go）共同遵守的约定。

原则（ADR 0003）：**只共享约定和测试向量，不共享代码。** TS 和 Go 各自实现，但必须对同一组向量给出相同结果。

## 内容

| 文件 | 说明 |
|---|---|
| `src/states.ts` | 站点可见性、站点状态、部署状态的取值 |
| `src/slug.ts` | slug 语法（TS 实现） |
| `vectors/slug.json` | slug 测试向量；Go 端测试在 `apps/gateway/internal/slug` |

## slug 语法（提议，W2 Day 1 与保留词一起确认）

- 3–32 个字符
- 只能包含 `a-z`、`0-9`、`-`
- 不能以 `-` 开头或结尾
- 不能包含连续的 `--`（避免与 punycode 的 `xn--` 混淆）

保留词（`www`、`app`、`admin`、`api` 等）是另一层规则，在 W2 Day 1 加入。

## 测试向量格式

```json
{
  "description": "…",
  "cases": [{ "input": "alice", "valid": true, "note": "可选说明" }]
}
```

修改向量后，TS 和 Go 两边的测试都必须通过（CI 会同时运行两边）。
