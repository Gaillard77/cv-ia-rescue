// pages/auth/signup.jsx
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignUp() {
  async function onSubmit(e) {
    e.preventDefault();
    const name = e.currentTarget.name.value;
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;

    const r = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    if (r.ok) {
      // Connexion directe après inscription
      await signIn("credentials", { email, password, callbackUrl: "/app" });
    } else {
      alert("Inscription impossible (email déjà utilisé ?).");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-gray-800/40 to-gray-900/60 shadow-[0_10px_35px_rgba(0,0,0,.5)]">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600" />
          <h1 className="text-xl font-bold">CV-IA</h1>
        </div>

        <h2 className="text-2xl font-semibold mb-1">Créer un compte</h2>
        <p className="text-white/70 text-sm mb-5">
          Rejoins l’atelier CV & Lettre en quelques secondes.
        </p>

        <form className="space-y-3" onSubmit={onSubmit}>
          <input name="name" placeholder="Nom (optionnel)" className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2" />
          <input name="email" type="email" required placeholder="Email"
                 className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2" />
          <input name="password" type="password" required placeholder="Mot de passe"
                 className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2" />
          <button type="submit"
                  className="w-full rounded-xl px-4 py-2.5 font-semibold bg-gradient-to-br from-indigo-500 to-violet-600 hover:brightness-110">
            Créer mon compte
          </button>
        </form>

        <div className="mt-5 text-sm text-white/70 flex items-center justify-between">
          <Link href="/" className="hover:text-white">← Accueil</Link>
          <Link href="/auth/signin" className="hover:text-white">J’ai déjà un compte</Link>
        </div>

        <div className="text-center text-xs text-white/50 mt-6">
          © {new Date().getFullYear()} CV-IA
        </div>
      </div>
    </div>
  );
}
