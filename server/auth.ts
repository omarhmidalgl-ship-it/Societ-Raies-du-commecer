import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendWelcomeEmail } from "./email";

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

export async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
    console.log(`[DEBUG-AUTH] Comparaison: Fourni (${supplied.length} chars) vs Stocké (${stored.length} chars)`);
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
        console.error(`[DEBUG-AUTH] Format invalide !`);
        return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    const match = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log(`[DEBUG-AUTH] Result: ${match ? 'MATCH' : 'NO_MATCH'}`);
    return match;
}

export function setupAuth(app: Express) {
    function sanitizeUser(user: SelectUser) {
        // Never send password hashes to the client
        // (keep it minimal: only remove password)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...safe } = user as any;
        return safe;
    }

    // ... (session codes)
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "sred_secret_key_2024",
        resave: false,
        saveUninitialized: false,
        store: new MemoryStore({
            checkPeriod: 86400000,
        }),
        cookie: {
            secure: app.get("env") === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        }
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (usernameOrEmail, password, done) => {
            try {
                console.log(`[DEBUG-AUTH] Tentative de connexion pour identifiant: "${usernameOrEmail}"`);

                // Try finding by username first
                let user = await storage.getUserByUsername(usernameOrEmail);
                if (user) console.log(`[DEBUG-AUTH] Utilisateur trouvé par username: ${user.username}`);

                // If not found, try finding by email
                if (!user) {
                    user = await storage.getUserByEmail(usernameOrEmail);
                    if (user) console.log(`[DEBUG-AUTH] Utilisateur trouvé par email: ${user.email} (Username: ${user.username})`);
                }

                if (!user) {
                    console.warn(`[DEBUG-AUTH] Aucun utilisateur trouvé avec l'identifiant: "${usernameOrEmail}"`);
                    return done(null, false);
                }

                const isMatch = await comparePasswords(password, user.password);
                if (!isMatch) {
                    console.warn(`[DEBUG-AUTH] Mot de passe incorrect pour: ${user.username}`);
                    return done(null, false);
                }

                console.log(`[DEBUG-AUTH] Connexion réussie pour: ${user.username}`);
                return done(null, user);
            } catch (err) {
                console.error(`[DEBUG-AUTH] Erreur fatale dans LocalStrategy:`, err);
                return done(err);
            }
        }),
    );

    passport.serializeUser((user, done) => done(null, (user as SelectUser).id));
    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.post("/api/register", async (req, res, next) => {
        try {
            const allUsers = await storage.getUsers();
            if (allUsers.length > 0) {
                return res.status(403).send("L'inscription publique est désactivée. Veuillez contacter un Super Admin.");
            }

            const existingUser = await storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            const existingEmail = await storage.getUserByEmail(req.body.email);
            if (existingEmail) {
                return res.status(400).send("Email already exists");
            }

            const hashedPassword = await hashPassword(req.body.password);
            const role = allUsers.length === 0 ? "superadmin" : "admin";

            const user = await storage.createUser({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                role: role,
            });

            // Envoyer l'email de bienvenue
            sendWelcomeEmail(user.email, user.username).catch(err => {
                console.error("[ERROR] Erreur envoi email bienvenue:", err);
            });

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(sanitizeUser(user as any));
            });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/login", (req, res, next) => {
        console.log(`[DEBUG-AUTH] Requête POST /api/login reçue pour: ${req.body.username}`);
        passport.authenticate("local", (err: any, user: SelectUser | false) => {
            if (err) return next(err);
            if (!user) return res.status(401).send("Invalid username or password");
            req.login(user, (err) => {
                if (err) return next(err);
                res.json(sanitizeUser(user));
            });
        })(req, res, next);
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.json(null);
        res.json(sanitizeUser(req.user as any));
    });
}
