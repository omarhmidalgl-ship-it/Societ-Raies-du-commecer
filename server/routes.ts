import express, { type Express } from "express";
import path from "path";
import { fileURLToPath } from "url";
import type { Server } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertMessageSchema, insertPromoSchema, insertSettingsSchema } from "@shared/schema";
import multer from "multer";
import fs from "fs";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import crypto from "crypto";
import { sendResetCodeEmail, sendWelcomeEmail } from "./email";
import { uploadImage } from "./cloudinary_util";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);

  // Password Reset Routes
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).send("Email requis");

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security, don't reveal if user exists, but send 200
        return res.status(200).send("Si un compte existe, un code de réinitialisation a été envoyé.");
      }

      // Generate 8-character hex code
      const resetCode = crypto.randomBytes(4).toString("hex");
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 10); // 10 minutes expiration

      console.log(`[DEBUG] Tentative d'envoi du code ${resetCode} à ${user.email}`);

      // Attempt to send email
      const emailSent = await sendResetCodeEmail(user.email, resetCode);

      if (!emailSent) {
        return res.status(500).send("Erreur lors de l'envoi de l'email. Veuillez vérifier la configuration SMTP.");
      }

      // Save token and expiration
      await storage.setResetToken(user.id, resetCode, expires);
      console.log(`[SUCCESS] Code envoyé et enregistré pour ${user.email}`);

      res.status(200).send("Si un compte existe, un code de réinitialisation a été envoyé.");
    } catch (error) {
      console.error("[ERROR] Dans /api/forgot-password:", error)
      res.status(500).send("Une erreur interne est survenue.");
    }
  });

  app.post("/api/verify-code", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).send("Email et code requis");
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).send("Utilisateur non trouvé");
      }

      const normalizedCode = code.toLowerCase().replace(/\s/g, '');
      const storedCode = user.resetToken?.toLowerCase().replace(/\s/g, '');

      console.log(`[DEBUG] Vérification du code pour ${email}: Saisi='${normalizedCode}', Attendu='${storedCode}'`);

      if (!storedCode || normalizedCode !== storedCode) {
        return res.status(400).send("Code de confirmation incorrect.");
      }

      if (user.resetTokenExpires && new Date() > user.resetTokenExpires) {
        return res.status(400).send("Le code a expiré.");
      }

      res.status(200).send("Code valide.");
    } catch (error) {
      console.error("[ERROR] Dans /api/verify-code:", error);
      res.status(500).send("Une erreur est survenue.");
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).send("Tous les champs sont requis");
      }

      if (code.length !== 8) {
        return res.status(400).send("Le code de confirmation doit faire exactement 8 caractères.");
      }

      if (newPassword.length < 6) {
        return res.status(400).send("Le nouveau mot de passe doit faire au moins 6 caractères.");
      }

      const user = await storage.getUserByEmail(email);
      const normalizedCode = code.toLowerCase().replace(/\s/g, '');
      const storedCode = user?.resetToken?.toLowerCase().replace(/\s/g, '');

      console.log(`[DEBUG] Finalisation reset pour ${email}: Saisi='${normalizedCode}', Attendu='${storedCode}'`);

      if (!user || storedCode !== normalizedCode) {
        return res.status(400).send("Code invalide ou email incorrect.");
      }

      // Check expiration
      if (user.resetTokenExpires && new Date() > user.resetTokenExpires) {
        return res.status(400).send("Le code a expiré. Veuillez en demander un nouveau.");
      }

      console.log(`[DEBUG] Finalisation reset pour ${email}. Longueur nouveau MDP: ${newPassword.length}`);
      const hashedPassword = await hashPassword(newPassword);
      console.log(`[DEBUG] Nouveau hash généré pour ${email} (Utilisateur: ${user.username})`);

      try {
        await storage.updateUserPassword(user.id, hashedPassword);
        console.log(`[DEBUG] Mot de passe mis à jour en base pour l'ID ${user.id} (${user.username})`);

        // Clear token
        await storage.setResetToken(user.id, null, null);
        console.log(`[DEBUG] Token de réinitialisation supprimé pour ${user.id}`);

        console.log(`[SUCCESS] Mot de passe réinitialisé pour ${user.username} (${user.email})`);
        res.status(200).send(`Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre identifiant "${user.username}" ou votre adresse email.`);
      } catch (dbError) {
        console.error(`[ERROR] Erreur lors de l'update en base pour ${user.id}:`, dbError);
        res.status(500).send("Erreur lors de l'enregistrement du nouveau mot de passe.");
      }
    } catch (error) {
      console.error("[ERROR] Dans /api/reset-password:", error);
      res.status(500).send("Une erreur est survenue lors de la réinitialisation.");
    }
  });

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Serve attached_assets (works both in local dev and Docker runtime)
  const assetsDirCandidates = [
    path.join(__dirname, "attached_assets"),
    path.resolve(__dirname, "..", "attached_assets"),
  ];
  const assetsDir = assetsDirCandidates.find((p) => fs.existsSync(p)) ?? assetsDirCandidates[0];
  app.use("/attached_assets", express.static(assetsDir));

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.get(api.messages.list.path, async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.delete(api.messages.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteMessage(id);
    if (!success) {
      return res.status(404).json({ message: "Message introuvable" });
    }
    res.json({ message: "Message supprimé" });
  });



  // Configure Multer to use memory storage
  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      // Accept images and PDF
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });

  app.patch("/api/settings/stickers-image", upload.single('stickersImage'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      // Upload to Cloudinary
      const stickersImageUrl = await uploadImage(req.file.buffer, 'settings');

      const settings = await storage.updateSettings({ stickersImageUrl });
      res.json(settings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/products", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      // Upload to Cloudinary
      const imageUrl = await uploadImage(req.file.buffer, 'products');

      const productData = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        imageUrl
      };

      // Basic validation
      if (!productData.name || !productData.description || !productData.category) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const success = await storage.deleteProduct(id);
    if (success) {
      res.sendStatus(204);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    console.log(`[DEBUG-PATCH] Product Update Request: ID=${req.params.id}, Auth=${req.isAuthenticated()}`);
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    try {
      console.log(`[DEBUG-PATCH] Body:`, req.body);
      const product = await storage.updateProduct(id, req.body);
      if (!product) {
        console.warn(`[DEBUG-PATCH] Product ID ${id} not found`);
        return res.status(404).json({ message: "Product not found" });
      }
      console.log(`[DEBUG-PATCH] Update Success:`, product.name);
      res.json(product);
    } catch (err) {
      console.error(`[DEBUG-PATCH] Error during update:`, err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Promos API
  app.get("/api/promos", async (req, res) => {
    const promos = await storage.getPromos();
    res.json(promos);
  });

  app.post("/api/promos", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      // Upload to Cloudinary
      const imageUrl = await uploadImage(req.file.buffer, 'promos');

      const promoData = {
        productName: req.body.productName,
        category: req.body.category,
        description: req.body.description,
        imageUrl
      };

      const promo = await storage.createPromo(promoData);
      res.status(201).json(promo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/promos/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const success = await storage.deletePromo(id);
    if (success) {
      res.sendStatus(204);
    } else {
      res.status(404).json({ message: "Promo not found" });
    }
  });

  app.patch("/api/promos/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    try {
      const promo = await storage.updatePromo(id, req.body);
      if (!promo) return res.status(404).json({ message: "Promo not found" });
      res.json(promo);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Settings API
  app.get("/api/settings", async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch("/api/settings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sticker Catalogs API
  app.get("/api/stickers", async (req, res) => {
    try {
      const catalogs = await storage.getStickerCatalogs();
      res.json(catalogs);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/stickers", upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      // Upload to Cloudinary
      const imageUrl = await uploadImage(req.file.buffer, 'stickers');

      const catalogData = {
        title: req.body.title,
        description: req.body.description || "",
        imageUrl
      };

      if (!catalogData.title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const catalog = await storage.createStickerCatalog(catalogData);
      res.status(201).json(catalog);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/stickers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const success = await storage.deleteStickerCatalog(id);
    if (success) {
      res.sendStatus(204);
    } else {
      res.status(404).json({ message: "Catalog not found" });
    }
  });

  app.patch("/api/stickers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    try {
      const catalog = await storage.updateStickerCatalog(id, req.body);
      if (!catalog) return res.status(404).json({ message: "Catalog not found" });
      res.json(catalog);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/change-password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { oldPassword, newPassword } = req.body;
      const user = req.user as any;

      const isMatch = await comparePasswords(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).send("L'ancien mot de passe est incorrect");
      }

      const hashed = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashed);

      res.status(200).send("Mot de passe mis à jour avec succès");
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe" });
    }
  });

  // User Management API (Super Admin only)
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "superadmin") return res.status(403).send("Accessible aux Super Admins uniquement");

    const userList = await storage.getUsers();
    // Don't leak passwords
    const sanitizedUsers = userList.map(({ password, ...u }) => u);
    res.json(sanitizedUsers);
  });

  app.post("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const currentUser = req.user as any;
    if (currentUser.role !== "superadmin") return res.status(403).send("Accessible aux Super Admins uniquement");

    console.log("[DEBUG-ADMIN] Requête de création d'utilisateur reçue:", req.body);
    try {
      const { username, email, password, role } = req.body;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) return res.status(400).send("Cet identifiant est déjà utilisé");

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) return res.status(400).send("Cet email est déjà utilisé");

      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: role || "admin"
      });

      const { password: _, ...sanitized } = newUser;

      // Send welcome email to the new admin
      sendWelcomeEmail(newUser.email, newUser.username).catch(err => {
        console.error("[ERROR] Erreur envoi email bienvenue admin:", err);
      });

      res.status(201).json(sanitized);
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const currentUser = req.user as any;
    if (currentUser.role !== "superadmin") return res.status(403).send("Accessible aux Super Admins uniquement");

    const targetId = parseInt(req.params.id);
    if (isNaN(targetId)) return res.status(400).send("ID invalide");

    const allUsers = await storage.getUsers();
    const superAdmins = allUsers.filter(u => u.role === "superadmin");
    const targetUser = allUsers.find(u => u.id === targetId);

    // Safety check: Don't delete yourself
    if (targetId === currentUser.id) {
      return res.status(400).send("Vous ne pouvez pas supprimer votre propre compte");
    }

    // BOSS RULE: Nobody can delete Mohamed
    if (targetUser?.username === "Mohamed") {
      return res.status(403).send("Le compte de Mohamed est protégé et ne peut pas être supprimé");
    }

    if (targetUser?.role === "superadmin" && superAdmins.length <= 1) {
      return res.status(400).send("Impossible de supprimer le dernier Super Admin");
    }

    const success = await storage.deleteUser(targetId);
    if (success) {
      res.sendStatus(204);
    } else {
      res.status(404).send("Utilisateur non trouvé");
    }
  });

  // Seed data
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    await storage.createProduct({
      name: "Bouquet de Roses Éternelles - Noir",
      description: "Un élégant bouquet de roses roses présenté dans un étui noir sophistiqué 'Best Wishes'. Parfait pour les cadeaux et la décoration haut de gamme.",
      imageUrl: "/attached_assets/qsdf_1768570430833.jpeg",
      category: "Cadeaux & Décor"
    });
    await storage.createProduct({
      name: "Bouquet de Roses Passion - Rose",
      description: "Roses rouges vibrantes dans un étui rose délicat. Une alliance parfaite entre passion et douceur pour vos événements spéciaux.",
      imageUrl: "/attached_assets/qsdqsd_1768570430833.jpeg",
      category: "Cadeaux & Décor"
    });
    await storage.createProduct({
      name: "Bouquet Lavande Sérénité - Rose",
      description: "Délicates roses lilas dans un étui rose, apportant une touche de calme et d'élégance à tout espace.",
      imageUrl: "/attached_assets/qsdqsdqds_1768570430834.jpeg",
      category: "Cadeaux & Décor"
    });
    await storage.createProduct({
      name: "Bouquet Azur Éclatant - Rose",
      description: "Roses bleues uniques dans un étui rose contrasté, pour une décoration audacieuse et mémorable.",
      imageUrl: "/attached_assets/WhatsApp_Image_2026-01-16_at_2.27.45_PM_1768570430834.jpeg",
      category: "Cadeaux & Décor"
    });
    await storage.createProduct({
      name: "Boîtes en Carton Sur Mesure",
      description: "Solutions d'emballage robustes et personnalisables pour tous vos besoins logistiques.",
      imageUrl: "https://images.unsplash.com/photo-1589793462417-10afb737d926?auto=format&fit=crop&q=80&w=800",
      category: "Emballage Industriel"
    });
  }

  return httpServer;
}
