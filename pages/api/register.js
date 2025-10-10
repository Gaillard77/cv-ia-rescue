// pages/api/register.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  const { email, password, name } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email et mot de passe requis." });

  const exist = await prisma.user.findUnique({ where: { email } });
  if (exist) return res.status(400).json({ error: "Cet email est déjà utilisé." });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed, name },
  });

  return res.status(201).json({ message: "Utilisateur créé", user });
}
