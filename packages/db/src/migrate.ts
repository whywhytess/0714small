import { fileURLToPath, pathToFileURL } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDb, requireDatabaseUrl } from "./index.ts";

export const migrationsFolder = fileURLToPath(new URL("../migrations", import.meta.url));

export async function runMigrations(url: string): Promise<void> {
  const { db, client } = createDb(url, { max: 1, onnotice: () => {} });
  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await client.end();
  }
}

// 用 pathToFileURL 比较，路径中含空格等字符时也能正确识别为直接运行
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runMigrations(requireDatabaseUrl());
  console.log("migrations applied");
}
