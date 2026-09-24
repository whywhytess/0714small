// 表定义从 W1 Day 1（users / sessions / email_tokens）开始加入。
// 新表如需让 Gateway 读取，必须在迁移中显式 `GRANT SELECT … TO gateway_ro`（ADR 0003）。
export {};
