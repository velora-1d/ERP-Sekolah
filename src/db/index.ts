import "dotenv/config";
import { cache } from "react";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

type DbSchema = typeof schema;

function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Database URL missing: set DATABASE_URL (e.g. in Vercel project env or .env.local).");
  }
  return new Pool({
    connectionString: url,
    maxUses: 1,
    ssl: { rejectUnauthorized: false },
  });
}

/**
 * Per-request Drizzle instance. Safe to use from Server Components via React `cache`
 * (one pool per request).
 */
export const getDb = cache((): NodePgDatabase<DbSchema> => {
  return drizzle(createPool(), { schema });
});

/** Async entry when a caller must await (e.g. some static paths); delegates to `getDb`. */
export async function getDbAsync(): Promise<NodePgDatabase<DbSchema>> {
  return getDb();
}

const dbProxy = new Proxy({} as NodePgDatabase<DbSchema>, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, instance);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

/** @deprecated Prefer `getDb()` in new code; proxy keeps existing `import { db }` call sites valid. */
export const db = dbProxy;
