import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,

    // Keep each Vercel instance lightweight.
    max: 2,

    // Close unused connections instead of keeping them open too long.
    idleTimeoutMillis: 10000,

    // Do not leave a request hanging forever if DB is unavailable.
    connectionTimeoutMillis: 10000,

    keepAlive: true,
    allowExitOnIdle: true,
  });

// Reuse the same pool inside the same warm Vercel instance.
globalForDb.__arenaNextJsPostgresqlPool = pool;

export const db = drizzle(pool);
