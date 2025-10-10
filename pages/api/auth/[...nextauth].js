// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Connexion",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const allowedEmail = process.env.AUTH_EMAIL;
        const allowedPassword = process.env.AUTH_PASSWORD;
        if (!credentials?.email || !credentials?.password) return null;
        if (
          credentials.email === allowedEmail &&
          credentials.password === allowedPassword
        ) {
          return { id: "user-1", name: "Utilisateur", email: allowedEmail };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/signin" },
};

export default NextAuth(authOptions);
