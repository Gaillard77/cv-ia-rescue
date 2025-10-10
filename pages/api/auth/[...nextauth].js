// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
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
          // Utilisateur “virtuel” validé
          return { id: "user-1", name: "Utilisateur", email: allowedEmail };
        }

        // Mauvais identifiants
        return null;
      },
    }),
    // 👉 Tu pourras ajouter Google plus tard si tu veux :
    // GoogleProvider({ clientId:..., clientSecret:... })
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  // On force l'utilisation de notre page de login custom
  pages: { signIn: "/auth/signin" },
});
