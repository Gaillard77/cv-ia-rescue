// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    // (Optionnel) Google
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Credentials (email/mot de passe)
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        if (!email || !password) throw new Error("Email et mot de passe requis");

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
          throw new Error("Identifiants invalides");
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new Error("Identifiants invalides");

        // ce qui sera dans le JWT
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id;
      return session;
    },
  },
});
