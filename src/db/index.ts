import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from './schema';

type AppDb = NodePgDatabase<typeof schema>;

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createPool() {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required when DEMO_AUTH is not true");
  }

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  return pool;
}

export const pool = databaseUrl ? createPool() : (undefined as unknown as Pool);
export const db: AppDb = databaseUrl
  ? drizzle(pool, { schema })
  : (undefined as unknown as AppDb);
