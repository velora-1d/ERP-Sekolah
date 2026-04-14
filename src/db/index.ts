import "dotenv/config";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

type DbSchema = typeof schema;

function resolveConnectionString(): { url: string; fromHyperdrive: boolean } {
  try {
    const { env } = getCloudflareContext();
    const hyper = env.HYPERDRIVE as { connectionString?: string } | undefined;
    if (hyper?.connectionString) {
      return { url: hyper.connectionString, fromHyperdrive: true };
    }
  } catch {
    /* not in a Cloudflare request context (e.g. `next dev` only) */
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Database URL missing: set DATABASE_URL for local Node, or bind HYPERDRIVE for Cloudflare Workers.",
    );
  }
  return { url, fromHyperdrive: false };
}

function createPool(): Pool {
  const { url, fromHyperdrive } = resolveConnectionString();
  return new Pool({
    connectionString: url,
    maxUses: 1,
    ...(!fromHyperdrive ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

/**
 * Per-request Drizzle instance (required on Cloudflare Workers — no cross-request pool reuse).
 * Safe to use from Server Components via React `cache` (one pool per request).
 */
export const getDb = cache((): NodePgDatabase<DbSchema> => {
  return drizzle(createPool(), { schema });
});

/** For static/ISR paths that need async Cloudflare context. */
export async function getDbAsync(): Promise<NodePgDatabase<DbSchema>> {
  const { env } = await getCloudflareContext({ async: true });
  const hyper = env.HYPERDRIVE as { connectionString?: string } | undefined;
  const url = hyper?.connectionString ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Database URL missing: set DATABASE_URL or HYPERDRIVE.connectionString.",
    );
  }
  const pool = new Pool({
    connectionString: url,
    maxUses: 1,
    ...(hyper?.connectionString ? {} : { ssl: { rejectUnauthorized: false } }),
  });
  return drizzle(pool, { schema });
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
