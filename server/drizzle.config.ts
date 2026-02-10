import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const url = process.env.DATABASE_URL || "file:./sred_showcase.db";
const isPostgres = url.startsWith("postgres://") || url.startsWith("postgresql://");

export default defineConfig({
    out: "./migrations",
    schema: "../shared/db-schema.ts",
    dialect: isPostgres ? "postgresql" : "sqlite",
    dbCredentials: {
        url: isPostgres ? url : (url.startsWith("file:") ? url.slice(5) : url),
    },
});
