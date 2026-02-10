import type { Product, InsertProduct, InsertMessage, Message, Promo, InsertPromo, User, InsertUser, Settings, InsertSettings, StickerCatalog, InsertStickerCatalog } from "@shared/schema";
import { db, products, messages, promos, users, settings, stickerCatalogs } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(): Promise<Message[]>;
  deleteMessage(id: number): Promise<boolean>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getPromos(): Promise<Promo[]>;
  createPromo(promo: InsertPromo): Promise<Promo>;
  updatePromo(id: number, promo: Partial<InsertPromo>): Promise<Promo | undefined>;
  deletePromo(id: number): Promise<boolean>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<void>;
  setResetToken(id: number, token: string | null, expires: Date | null): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  // Sticker Catalogs
  getStickerCatalogs(): Promise<StickerCatalog[]>;
  createStickerCatalog(data: InsertStickerCatalog): Promise<StickerCatalog>;
  updateStickerCatalog(id: number, data: Partial<InsertStickerCatalog>): Promise<StickerCatalog | undefined>;
  deleteStickerCatalog(id: number): Promise<boolean>;

}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id)).returning();
    return result.length > 0;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(update).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getPromos(): Promise<Promo[]> {
    return await db.select().from(promos).orderBy(desc(promos.createdAt));
  }

  async createPromo(insertPromo: InsertPromo): Promise<Promo> {
    const [promo] = await db.insert(promos).values(insertPromo).returning();
    return promo;
  }

  async updatePromo(id: number, update: Partial<InsertPromo>): Promise<Promo | undefined> {
    const [promo] = await db.update(promos).set(update).where(eq(promos.id, id)).returning();
    return promo;
  }

  async deletePromo(id: number): Promise<boolean> {
    const result = await db.delete(promos).where(eq(promos.id, id)).returning();
    return result.length > 0;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (user && !user.role) (user as any).role = "admin";
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (user && !user.role) (user as any).role = "admin";
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    console.log(`[DEBUG-DB] Mise à jour du mot de passe pour l'utilisateur ID: ${id}`);
    const result = await db.update(users).set({ password }).where(eq(users.id, id)).returning();
    if (result.length === 0) {
      console.error(`[DEBUG-DB] ÉCHEC : Utilisateur ID ${id} non trouvé`);
      throw new Error(`User with ID ${id} not found for password update`);
    }
    console.log(`[DEBUG-DB] Mot de passe mis à jour avec succès pour ID: ${id}`);
  }

  async setResetToken(id: number, token: string | null, expires: Date | null): Promise<void> {
    await db.update(users).set({ resetToken: token, resetTokenExpires: expires }).where(eq(users.id, id)).returning();
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async getUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers.map((u: User) => ({ ...u, role: u.role || "admin" }));
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Sticker Catalogs
  async getStickerCatalogs(): Promise<StickerCatalog[]> {
    return await db.select().from(stickerCatalogs);
  }

  async createStickerCatalog(data: InsertStickerCatalog): Promise<StickerCatalog> {
    const [catalog] = await db.insert(stickerCatalogs).values(data).returning();
    return catalog;
  }

  async updateStickerCatalog(id: number, update: Partial<InsertStickerCatalog>): Promise<StickerCatalog | undefined> {
    const [catalog] = await db.update(stickerCatalogs).set(update).where(eq(stickerCatalogs.id, id)).returning();
    return catalog;
  }

  async deleteStickerCatalog(id: number): Promise<boolean> {
    const result = await db.delete(stickerCatalogs).where(eq(stickerCatalogs.id, id)).returning();
    return result.length > 0;
  }

  async updateUserRole(id: number, role: string): Promise<void> {
    await db.update(users).set({ role }).where(eq(users.id, id)).returning();
  }

  async getSettings(): Promise<Settings> {
    const [s] = await db.select().from(settings).limit(1);
    if (!s) {
      // Create default settings if none exist
      const [newSettings] = await db.insert(settings).values({
        instagramReel: "",
        facebookReel: "",
        tiktokReel: ""
      }).returning();
      return newSettings;
    }
    return s;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = await this.getSettings();
    const [s] = await db.update(settings)
      .set({ ...insertSettings, updatedAt: new Date() })
      .where(eq(settings.id, existing.id))
      .returning();
    return s;
  }
}

export const storage = new DatabaseStorage();
