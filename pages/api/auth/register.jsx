// pages/auth/register.jsx
import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
 
  const hash = await bcrypt.hash(password, 10);
const ok = await bcrypt.compare(password, user.password);


  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(""); setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();
    if (!res.ok) setError(data.error || "Erreur d’inscription");
    else setMsg("Compte créé avec succès ! Vous pouvez vous connecter.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white p-6">
      <div className="max-w-md w-full border border-white/10 rounded-2xl bg-[#111827] p-6">
        <h1 className="text-2xl font-bold mb-4">Créer un compte</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom"
            className="w-full rounded-xl p-3 bg-[#0f1526] border border-white/15"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl p-3 bg-[#0f1526] border border-white/15"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-xl p-3 bg-[#0f1526] border border-white/15"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 py-3 font-semibold hover:brightness-110"
          >
            Créer le compte
          </button>
        </form>

        {msg && <p className="text-green-400 mt-3">{msg}</p>}
        {error && <p className="text-red-400 mt-3">{error}</p>}

        <p className="text-center mt-4 text-sm">
          Déjà un compte ? <Link href="/auth/signin" className="text-indigo-400 hover:underline">Connexion</Link>
        </p>
      </div>
    </div>
  );
}
