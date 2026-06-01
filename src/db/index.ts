import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

type DbSchema = typeof schema;
type DbInstance = NodePgDatabase<DbSchema>;

const globalForDb = globalThis as unknown as {
  globalPool: Pool | undefined;
  globalDb: DbInstance | undefined;
};

function normalizeConnectionString(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
}

function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Database URL missing: set DATABASE_URL in Dokploy environment variables.");
  }

  return new Pool({
    connectionString: normalizeConnectionString(url),
    max: 50,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
    ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });
}

function createDb(): DbInstance {
  globalForDb.globalPool ??= createPool();
  return drizzle(globalForDb.globalPool, { schema });
}

/** Gunakan ini untuk semua query DB. */
export const getDb = (): DbInstance => {
  globalForDb.globalDb ??= createDb();
  return globalForDb.globalDb;
};

/**
 * Proxy lazy init supaya import `db` tidak langsung crash saat Next build.
 * Koneksi DB baru dibuat saat query benar-benar dipanggil di runtime.
 */
export const db = new Proxy({} as DbInstance, {
  get(_target, prop, receiver) {
    const target = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(target, prop, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  },
}) as DbInstance;
