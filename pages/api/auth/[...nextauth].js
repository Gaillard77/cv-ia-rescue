// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Email & mot de passe",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("Utilisateur inconnu.");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Mot de passe incorrect.");

        return { id: user.id, name: user.name || "Utilisateur", email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/signin" },
};

export default NextAuth(authOptions);
