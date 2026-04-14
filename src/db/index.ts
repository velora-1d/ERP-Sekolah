import "dotenv/config";
import { cache } from "react";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

type DbSchema = typeof schema;

function normalizeConnectionString(url: string): string {
  const parsed = new URL(url);
  const sslmode = parsed.searchParams.get("sslmode");
  const needsCompatFlag = sslmode === "prefer" || sslmode === "require" || sslmode === "verify-ca";

  // pg warns that these sslmode values will change semantics in a future major.
  // Preserve current behavior explicitly so build/runtime logs stay clean on Vercel.
  if (needsCompatFlag && !parsed.searchParams.has("uselibpqcompat")) {
    parsed.searchParams.set("uselibpqcompat", "true");
  }

  return parsed.toString();
}

function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Database URL missing: set DATABASE_URL (e.g. in Vercel project env or .env.local).");
  }
  return new Pool({
    connectionString: normalizeConnectionString(url),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
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
