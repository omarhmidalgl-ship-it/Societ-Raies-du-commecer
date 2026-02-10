import { pgTable, text as pgText, serial, boolean, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { sqliteTable, text as sqliteText, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// --- PostgreSQL Schema ---

export const pgProducts = pgTable("products", {
  id: serial("id").primaryKey(),
  name: pgText("name").notNull(),
  description: pgText("description").notNull(),
  imageUrl: pgText("image_url").notNull(),
  category: pgText("category").notNull(),
});

export const pgMessages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: pgText("name").notNull(),
  phone: pgText("phone").notNull(),
  message: pgText("message").notNull(),
  selectedItems: pgText("selected_items"),
  read: boolean("read").notNull().default(false),
  createdAt: pgTimestamp("created_at").defaultNow(),
});

export const pgUsers = pgTable("users", {
  id: serial("id").primaryKey(),
  username: pgText("username").notNull().unique(),
  email: pgText("email").notNull().unique(),
  password: pgText("password").notNull(),
  role: pgText("role").notNull().default("admin"),
  resetToken: pgText("reset_token"),
  resetTokenExpires: pgTimestamp("reset_token_expires"),
});

export const pgPromos = pgTable("promos", {
  id: serial("id").primaryKey(),
  productName: pgText("product_name"),
  category: pgText("category"),
  description: pgText("description"),
  imageUrl: pgText("image_url").notNull(),
  createdAt: pgTimestamp("created_at").defaultNow(),
});

export const pgStickerCatalogs = pgTable("sticker_catalogs", {
  id: serial("id").primaryKey(),
  title: pgText("title").notNull(),
  description: pgText("description").notNull(),
  imageUrl: pgText("image_url").notNull(), // Switched from pdfUrl
});

export const pgSettings = pgTable("settings", {
  id: serial("id").primaryKey(),
  instagramReel: pgText("instagram_reel"),
  facebookReel: pgText("facebook_reel"),
  tiktokReel: pgText("tiktok_reel"),
  stickersImageUrl: pgText("stickers_image_url"), // Switched from pdfUrl
  updatedAt: pgTimestamp("updated_at").defaultNow(),
});

export const pgSchema = {
  products: pgProducts,
  messages: pgMessages,
  users: pgUsers,
  promos: pgPromos,
  stickerCatalogs: pgStickerCatalogs,
  settings: pgSettings,
};

// --- SQLite Schema ---

export const sqliteProducts = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: sqliteText("name").notNull(),
  description: sqliteText("description").notNull(),
  imageUrl: sqliteText("image_url").notNull(),
  category: sqliteText("category").notNull(),
});

export const sqliteMessages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: sqliteText("name").notNull(),
  phone: sqliteText("phone").notNull(),
  message: sqliteText("message").notNull(),
  selectedItems: sqliteText("selected_items"),
  read: integer("read", { mode: 'boolean' }).notNull().default(sql`0`),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const sqliteUsers = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: sqliteText("username").notNull().unique(),
  email: sqliteText("email").notNull().unique(),
  password: sqliteText("password").notNull(),
  role: sqliteText("role").notNull().default("admin"),
  resetToken: sqliteText("reset_token"),
  resetTokenExpires: integer("reset_token_expires", { mode: 'timestamp' }),
});

export const sqlitePromos = sqliteTable("promos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productName: sqliteText("product_name"),
  category: sqliteText("category"),
  description: sqliteText("description"),
  imageUrl: sqliteText("image_url").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const sqliteStickerCatalogs = sqliteTable("sticker_catalogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: sqliteText("title").notNull(),
  description: sqliteText("description").notNull(),
  imageUrl: sqliteText("image_url").notNull(), // Switched from pdfUrl
});

export const sqliteSettings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  instagramReel: sqliteText("instagram_reel"),
  facebookReel: sqliteText("facebook_reel"),
  tiktokReel: sqliteText("tiktok_reel"),
  stickersImageUrl: sqliteText("stickers_image_url"), // Switched from pdfUrl
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const sqliteSchema = {
  products: sqliteProducts,
  messages: sqliteMessages,
  users: sqliteUsers,
  promos: sqlitePromos,
  stickerCatalogs: sqliteStickerCatalogs,
  settings: sqliteSettings,
};
