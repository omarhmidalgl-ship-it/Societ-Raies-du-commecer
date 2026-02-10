import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// For Postgres deployments, skip SQLite-specific file operations.
const dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.startsWith('file:') || dbUrl.match(/^\//)) {
    const rawPath = dbUrl.replace(/^file:/, '') || "./sred_showcase.db";
    const dbPath = path.isAbsolute(rawPath)
        ? rawPath
        : path.resolve(__dirname, "..", rawPath);

    console.log(`Connecting to sqlite database at: ${dbPath}`);
    const db = new Database(dbPath);

    try {
        console.log("Checking if 'read' column exists in 'messages' table...");
        const info = db.prepare("PRAGMA table_info(messages)").all() as any[];
        const hasRead = info.some(col => col.name === "read");

        if (!hasRead) {
            console.log("Adding 'read' column to 'messages' table...");
            db.prepare("ALTER TABLE messages ADD COLUMN read INTEGER NOT NULL DEFAULT 0").run();
            console.log("Column 'read' added successfully.");
        } else {
            console.log("Column 'read' already exists.");
        }

        const productInfo = db.prepare("PRAGMA table_info(products)").all() as any[];
        const hasType = productInfo.some(col => col.name === "type");
        const hasMaterial = productInfo.some(col => col.name === "material");

        if (hasType || hasMaterial) {
            console.log("Note: 'products' table still has 'type' and/or 'material' columns in the DB, but they are now ignored by the app.");
        }

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        db.close();
    }
} else {
    console.log("DATABASE_URL points to a non-file database (likely Postgres). Skipping sqlite-specific migrations.");
}
