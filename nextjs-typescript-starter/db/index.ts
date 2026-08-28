import 'server-only';

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@/db/schema';

type Database = PostgresJsDatabase<typeof schema>;
type SqlClient = ReturnType<typeof postgres>;

type DatabaseCache = {
  database?: Database;
  databaseUrl?: string;
  sqlClient?: SqlClient;
};

const globalForDatabase = globalThis as typeof globalThis & {
  wordIslandDatabase?: DatabaseCache;
};

export class DatabaseConfigurationError extends Error {
  constructor() {
    super('DATABASE_URL is not configured');
    this.name = 'DatabaseConfigurationError';
  }
}

function getDatabaseUrl() {
  const databaseUrl = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ].find((value) => value?.trim());

  if (!databaseUrl) {
    throw new DatabaseConfigurationError();
  }

  return databaseUrl;
}

export function getDatabase(): Database {
  const databaseUrl = getDatabaseUrl();
  const cache =
    globalForDatabase.wordIslandDatabase ??
    (globalForDatabase.wordIslandDatabase = {});

  if (cache.database && cache.databaseUrl === databaseUrl) {
    return cache.database;
  }

  const sqlClient = postgres(databaseUrl, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 1,
    prepare: false,
    ssl: 'require',
  });
  const database = drizzle(sqlClient, { schema });

  cache.database = database;
  cache.databaseUrl = databaseUrl;
  cache.sqlClient = sqlClient;

  return database;
}
