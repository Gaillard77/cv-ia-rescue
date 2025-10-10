// pages/auth/signin.jsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res.error) {
      setError("❌ " + res.error);
    } else {
      router.push("/app");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white p-6">
      <div className="max-w-md w-full border border-white/10 rounded-2xl bg-[#111827] p-6 shadow-xl">
        <div className="flex flex-col items-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-2" />
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="text-white/60 text-sm mt-1 text-center">
            Connecte-toi pour accéder à ton espace CV & Lettre.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-white/70 mb-2 font-medium">Email</label>
            <input
              type="email"
              placeholder="exemple@mail.com"
              className="w-full rounded-xl p-3 bg-[#0f1526] border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-white/70 mb-2 font-medium">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl p-3 bg-[#0f1526] border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm font-medium text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 py-3 font-semibold hover:brightness-110 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-white/70">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/register"
            className="text-indigo-400 hover:underline font-medium"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
