import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["{apps,packages}/*/src/**/*.test.ts"],
          exclude: ["**/*.int.test.ts", "**/node_modules/**"],
        },
      },
      {
        // 需要 `pnpm infra:up` 启动的 PostgreSQL / S3 兼容存储
        test: {
          name: "integration",
          include: ["{apps,packages}/*/src/**/*.int.test.ts"],
          fileParallelism: false,
        },
      },
    ],
  },
});
