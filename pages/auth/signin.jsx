// pages/auth/signin.jsx
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const res = await signIn("credentials", {
      redirect: false,        // on gère nous-mêmes l'erreur
      email,
      password,
      callbackUrl: "/app",    // où aller après connexion
    });

    if (res?.error) setErr("Email ou mot de passe incorrect.");
    else if (res?.ok) window.location.href = res.url || "/app";
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-gray-800/40 to-gray-900/60 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600" />
          <h1 className="text-xl font-bold">CV-IA</h1>
        </div>

        <h2 className="text-2xl font-semibold mb-2">Connexion</h2>
        <p className="text-white/70 mb-4">
          Entre ton email et ton mot de passe pour accéder à l’atelier CV & Lettre.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-white/70">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: test@cvia.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Mot de passe</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ex: 123456"
              required
            />
          </div>

          {err && <div className="text-red-400 text-sm">{err}</div>}

          <button
            type="submit"
            className="w-full rounded-xl px-4 py-3 font-semibold bg-gradient-to-br from-indigo-500 to-violet-600 hover:brightness-110 shadow-[0_10px_30px_rgba(99,102,241,.35)]"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/" className="text-white/70 hover:text-white text-sm">
            ← Retour à l’accueil
          </Link>
        </div>

        <p className="text-[11px] text-white/50 mt-4 text-center">
          En continuant, tu acceptes nos conditions et notre politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
