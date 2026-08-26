import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

const globalForDatabase = globalThis as typeof globalThis & {
  ciyuPostgresClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDatabase.ciyuPostgresClient ??
  postgres(databaseUrl, {
    // Supabase transaction pooler does not support prepared statements.
    prepare: false,
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.ciyuPostgresClient = client;
}

export const db = drizzle({ client });
export { client as sql };
