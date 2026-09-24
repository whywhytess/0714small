import { defineConfig } from "drizzle-kit";

// 只用于 `drizzle-kit generate` 生成迁移；运行迁移用 src/migrate.ts，不依赖 drizzle-kit。
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
});
