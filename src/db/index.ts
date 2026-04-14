import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

type DbSchema = typeof schema;

function normalizeConnectionString(url: string): string {
  const parsed = new URL(url);
  const sslmode = parsed.searchParams.get("sslmode");
  const needsCompatFlag = sslmode === "prefer" || sslmode === "require" || sslmode === "verify-ca";

  if (needsCompatFlag && !parsed.searchParams.has("uselibpqcompat")) {
    parsed.searchParams.set("uselibpqcompat", "true");
  }

  return parsed.toString();
}

// Pool GLOBAL — dibuat SEKALI saat module di-load, digunakan bersama
// oleh semua request. Ini adalah pola yang benar untuk Serverless/Vercel.
// max:3 dipilih untuk menghormati batas koneksi free tier PostgreSQL.
const globalPool = (() => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Database URL missing: set DATABASE_URL (e.g. in Vercel project env or .env.local).");
  }
  return new Pool({
    connectionString: normalizeConnectionString(url),
    max: 5,                    // 5 koneksi aktif — cukup untuk beberapa user bersamaan
    idleTimeoutMillis: 10000,  // Lepas koneksi idle setelah 10 detik
    connectionTimeoutMillis: 10000, // Tunggu hingga 10 detik sebelum throw error
    ssl: { rejectUnauthorized: false },
  });
})();

// Instance Drizzle global — berbagi pool yang sama
const globalDb = drizzle(globalPool, { schema });

/** Gunakan ini untuk semua query DB. */
export const getDb = (): NodePgDatabase<DbSchema> => globalDb;

/** @deprecated Alias untuk kompatibilitas `import { db }` yang sudah ada. */
export const db = globalDb;
