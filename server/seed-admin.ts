import { db, users } from "./db";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
    console.log("--- Seeding Admins ---");

    const seedPassword = process.env.SEED_ADMIN_PASSWORD || "password123";
    const updateExisting =
        process.env.SEED_ADMIN_UPDATE_EXISTING === "1" ||
        process.env.SEED_ADMIN_UPDATE_EXISTING === "true";
    if (!process.env.SEED_ADMIN_PASSWORD) {
        console.warn(
            "[seed-admin] SEED_ADMIN_PASSWORD is not set; using default password. Set SEED_ADMIN_PASSWORD for production.",
        );
    }
    if (updateExisting) {
        console.warn(
            "[seed-admin] SEED_ADMIN_UPDATE_EXISTING is enabled: existing admin accounts may be updated.",
        );
    }

    const admins = [
        {
            username: "Mohamed",
            email: "raiesmohamedali18@gmail.com",
            password: seedPassword, // Ils devront le changer à la première connexion
            role: "superadmin"
        },
        {
            username: "Omar",
            email: "omar.hmida.lgl@gmail.com",
            password: seedPassword,
            role: "superadmin"
        }
    ];

    for (const admin of admins) {
        const existing = await db.select().from(users).where(eq(users.username, admin.username)).limit(1);

        if (existing.length === 0) {
            const hashedPassword = await hashPassword(admin.password);
            await db.insert(users).values({
                username: admin.username,
                email: admin.email,
                password: hashedPassword,
                role: admin.role
            });
            console.log(`✅ Admin ${admin.username} créé.`);
        } else {
            const current = existing[0] as any;
            const storedPassword: string = String(current.password ?? "");
            const storedPasswordLooksHashed = storedPassword.includes(".") && storedPassword.length > 50;

            if (updateExisting || !storedPasswordLooksHashed) {
                const hashedPassword = await hashPassword(admin.password);
                await db
                    .update(users)
                    .set({
                        email: admin.email,
                        password: hashedPassword,
                        role: admin.role,
                    })
                    .where(eq(users.username, admin.username));
                console.log(`♻️ Admin ${admin.username} mis à jour (password/email/role).`);
            } else {
                console.log(`ℹ️ Admin ${admin.username} existe déjà.`);
            }
        }
    }

    console.log("--- Seeding Terminé ---");
    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Erreur seeding:", err);
    process.exit(1);
});
