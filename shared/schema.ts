import { z } from "zod";

export const PRODUCT_CATEGORIES = [
  "Naissance",
  "Mariage",
  "Anniversaire",
  "Soutenance",
  "العمرة",
  "Emballage",
  "Patisserie",
  "Cadeaux & Décor",
  "Nouveautés",
  "Ramadan",
  "Saint Valentin",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type Product = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
};

export type Message = {
  id: number;
  name: string;
  phone: string;
  message: string;
  selectedItems: string | null;
  read: boolean;
  createdAt: Date | string | null;
};

export type Promo = {
  id: number;
  productName: string | null;
  category: string | null;
  description: string | null;
  imageUrl: string;
  createdAt: Date | string | null;
};

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  resetToken: string | null;
  resetTokenExpires: Date | string | null;
};

export type Settings = {
  id: number;
  instagramReel: string | null;
  facebookReel: string | null;
  tiktokReel: string | null;
  stickersImageUrl: string | null;
  updatedAt: Date | string | null;
};

export type StickerCatalog = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
};

export const insertProductSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().min(1, "Description requise"),
  imageUrl: z.string().min(1, "Image requise"),
  category: z.string().min(1, "Catégorie requise"),
});

export const insertMessageSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  phone: z.string().min(8, "Numéro de téléphone invalide (min 8 caractères)"),
  message: z.string().min(1, "Message requis"),
  selectedItems: z.string().optional(),
});

export const insertPromoSchema = z.object({
  productName: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image requise"),
});

export const insertUserSchema = z.object({
  username: z.string().min(1, "Identifiant requis"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  role: z.string().optional(),
});

export const insertSettingsSchema = z.object({
  instagramReel: z.string().optional(),
  facebookReel: z.string().optional(),
  tiktokReel: z.string().optional(),
  stickersImageUrl: z.string().optional(),
});

export const insertStickerCatalogSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().min(1, "Description requise"),
  imageUrl: z.string().min(1, "Image requise"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Identifiant requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const productSchema: z.ZodType<Product> = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  category: z.string(),
});

export const messageSchema: z.ZodType<Message> = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  message: z.string(),
  selectedItems: z.string().nullable(),
  read: z.boolean(),
  createdAt: z.union([z.string(), z.date()]).nullable(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertPromo = z.infer<typeof insertPromoSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertStickerCatalog = z.infer<typeof insertStickerCatalogSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

