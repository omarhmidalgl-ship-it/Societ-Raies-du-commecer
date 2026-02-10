-- Initial schema for SRED (Postgres)

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  selected_items TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  reset_token TEXT,
  reset_token_expires TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promos (
  id SERIAL PRIMARY KEY,
  product_name TEXT,
  category TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sticker_catalogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pdf_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  instagram_reel TEXT,
  facebook_reel TEXT,
  tiktok_reel TEXT,
  stickers_pdf_url TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
