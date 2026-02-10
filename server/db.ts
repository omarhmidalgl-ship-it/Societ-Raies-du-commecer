import "./env.ts";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import pg from "pg";
import Database from "better-sqlite3";
import { pgSchema, sqliteSchema } from "shared/db-schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isPostgres = process.env.DATABASE_URL.startsWith("postgres://") ||
  process.env.DATABASE_URL.startsWith("postgresql://");

export let db: any;
export let schema: any;

if (isPostgres) {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  });
  db = drizzlePg(pool, { schema: pgSchema });
  schema = pgSchema;
} else {
  // Support both file:./path and plain path
  const dbPath = process.env.DATABASE_URL.startsWith("file:")
    ? process.env.DATABASE_URL.slice(5)
    : process.env.DATABASE_URL;

  const sqlite = new Database(dbPath);
  db = drizzleSqlite(sqlite, { schema: sqliteSchema });
  schema = sqliteSchema;
}

export const { products, messages, users, promos, stickerCatalogs, settings } = schema;
