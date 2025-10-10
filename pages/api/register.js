// pages/api/register.js
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { email, password, name } = req.body || {};

    // Validations basiques
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Champs manquants" });
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return res.status(400).json({ error: "Email invalide" });
    if (password.length < 6)
      return res.status(400).json({ error: "Mot de passe trop court (min. 6)" });

    // Vérifie si un user existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });

    // Cas 1 : user déjà présent avec un mot de passe -> refuse
    if (existing && existing.password && existing.password.length > 0) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet e-mail" });
    }

    // Hash du password
    const hashed = await bcrypt.hash(password, 10);

    // Cas 2 : user créé via Google (pas de password) -> on complète
    if (existing && !existing.password) {
      await prisma.user.update({
        where: { email },
        data: { name, password: hashed },
      });
      return res.status(200).json({ ok: true, message: "Compte complété, vous pouvez vous connecter." });
    }

    // Cas 3 : création normale
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
      },
    });

    return res.status(200).json({ ok: true, message: "Compte créé avec succès !" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
