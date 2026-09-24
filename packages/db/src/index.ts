import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";

export { schema };

export function requireDatabaseUrl(name = "DATABASE_URL"): string {
  const url = process.env[name];
  if (!url) throw new Error(`${name} is not set (see .env.example)`);
  return url;
}

export function createDb(url: string, options: postgres.Options<Record<string, never>> = {}) {
  const client = postgres(url, { max: 10, ...options });
  return { db: drizzle(client, { schema }), client };
}
