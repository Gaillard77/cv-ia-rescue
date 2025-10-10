// pages/auth/register.jsx
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d’inscription");
      setMessage(data.message || "Compte créé avec succès !");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white px-4">
      <div className="w-full max-w-md border border-white/10 rounded-2xl bg-[#111827] p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Créer un compte</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 mb-1">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jean Dupont"
              className="w-full rounded-xl p-3 bg-[#0f1526] border border-white/15 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-white/70 mb-1">Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemple@mail.com"
              className="w-full rounded-xl p-3 bg-[#0f1526] border border-white/15 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-white/70 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-xl p-3 bg-[#0f1526] border border-white/15 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-white/50 mt-1">
              Minimum 6 caractères
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 py-3 font-semibold hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Création du compte..." : "Créer le compte"}
          </button>
        </form>

        {message && <p className="text-green-400 mt-4 text-center">{message}</p>}
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

        <p className="text-center mt-6 text-sm text-white/70">
          Déjà un compte ?{" "}
          <Link
            href="/auth/signin"
            className="text-indigo-400 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
