import nodemailer from "nodemailer";

// SMTP Configuration
const SMTP_USER = process.env.SMTP_USER || "emballage.raies@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || ""; // Ton app password Gmail

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendResetCodeEmail(to: string, code: string) {
  const LOGO_URL = "https://i.imgur.com/xxx.png"; // Remplace par ton vrai logo
  const ADMIN_URL = process.env.APP_URL || "http://localhost:5173";

  const mailOptions = {
    from: `"SRED Admin" <${SMTP_USER}>`,
    to,
    subject: "Code de réinitialisation - SRED",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f0f7ff; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 3px solid #0056b3; overflow: hidden;">
            <div style="background-color: #0056b3; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 40px; color: #ffffff; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">SRED</h1>
              <div style="color: #ffffff; font-size: 20px; font-weight: bold; margin-top: 5px;">RÉINITIALISATION</div>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff; color: #333333;">
              <h2 style="color: #0056b3; margin-top: 0; font-size: 24px;">Bonjour,</h2>
              <p style="font-size: 16px; line-height: 1.5;">Vous avez demandé un code de réinitialisation pour votre compte SRED.</p>
              
              <div style="background-color: #e6f2ff; border: 2px solid #0056b3; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
                <div style="font-size: 14px; color: #0056b3; font-weight: bold; text-transform: uppercase;">Votre code (10 min)</div>
                <div style="font-size: 48px; font-weight: 900; color: #0056b3; letter-spacing: 5px; margin: 15px 0;">${code}</div>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${ADMIN_URL}/admin" style="display: inline-block; background-color: #0056b3; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold;">Retour à l'Administration</a>
              </div>

              <p style="font-size: 14px; color: #64748b; font-style: italic; margin-top: 30px; border-left: 3px solid #cbd5e1; padding-left: 15px;">
                Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.
              </p>
            </div>
            <div style="text-align: center; padding: 30px; background: #f8fafc; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-weight: 600;">© ${new Date().getFullYear()} SRED - Emballages et Décors</p>
              <p style="margin-top: 5px; opacity: 0.8;">Ceci est un message automatique, veuillez ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé avec succès: %s", info.messageId);
    return true;
  } catch (error: any) {
    console.error("❌ Erreur critique lors de l'envoi de l'email:", error.message);
    if (error.code === 'EAUTH') {
      console.error("🔐 ÉCHEC D'AUTHENTIFICATION: Vérifiez vos identifiants SMTP dans le fichier .env");
    }
    return false;
  }
}

export async function sendWelcomeEmail(to: string, username: string) {
  const ADMIN_URL = process.env.APP_URL || "http://localhost:5173";
  const mailOptions = {
    from: `"SRED Admin" <${SMTP_USER}>`,
    to,
    subject: "Bienvenue chez SRED - Votre compte est prêt !",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f0f7ff; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 3px solid #0056b3; overflow: hidden;">
            <div style="background-color: #0056b3; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 40px; color: #ffffff; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">SRED</h1>
              <div style="color: #ffffff; font-size: 20px; font-weight: bold; margin-top: 5px;">BIENVENUE</div>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff; color: #333333;">
              <h2 style="color: #0056b3; margin-top: 0; font-size: 24px;">Félicitations ${username} !</h2>
              <p style="font-size: 16px; line-height: 1.5;">Votre compte d'administration SRED a été créé avec succès par un Super Admin.</p>
              
              <div style="background-color: #f0f7ff; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 5px solid #0056b3;">
                <p style="margin: 0; font-size: 16px; color: #0056b3; font-weight: bold;">Identifiant : ${username}</p>
                <p style="margin: 10px 0 0; font-size: 14px; color: #555;">Vous pouvez maintenant vous connecter pour gérer vos produits, messages et promotions.</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${ADMIN_URL}/admin" style="display: inline-block; background-color: #0056b3; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold;">Se connecter au Dashboard</a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Nous sommes ravis de vous compter parmi nous !
              </p>
            </div>
            <div style="text-align: center; padding: 25px; background: #f8fafc; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-weight: 600;">© ${new Date().getFullYear()} SRED - Emballages et Décors</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome Email envoyé avec succès: %s", info.messageId);
    return true;
  } catch (error: any) {
    console.error("❌ Erreur lors de l'envoi du welcome email:", error.message);
    return false;
  }
}
