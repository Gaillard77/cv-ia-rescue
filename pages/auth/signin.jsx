// pages/auth/signin.jsx
import { getProviders, signIn } from "next-auth/react";
import Link from "next/link";

export default function SignIn({ providers, callbackUrl = "/app" }) {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header simple */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow" />
          <h1 className="text-2xl font-bold">CV-IA</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-gray-800/40 to-gray-900/60 p-6 shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
          <h2 className="text-xl font-semibold mb-2 text-center">Connexion</h2>
          <p className="text-white/70 text-sm text-center mb-6">
            Connecte-toi pour accéder à l’atelier CV & Lettre.
          </p>

          {/* Boutons providers */}
          <div className="space-y-3">
            {providers &&
              Object.values(providers).map((p) => (
                <button
                  key={p.id}
                  onClick={() => signIn(p.id, { callbackUrl })}
                  className="w-full rounded-xl px-4 py-3 font-semibold bg-gradient-to-br from-indigo-500 to-violet-600 hover:brightness-110 shadow-[0_10px_30px_rgba(99,102,241,.35)]"
                >
                  {p.id === "google" ? "Continuer avec Google" : `Continuer avec ${p.name}`}
                </button>
              ))}
          </div>

          {/* Lien retour */}
          <div className="text-center mt-5">
            <Link href="/" className="text-white/70 text-sm hover:text-white">
              ← Retour à l’accueil
            </Link>
          </div>

          {/* Mentions */}
          <div className="text-[11px] text-white/50 text-center mt-6">
            En continuant, tu acceptes nos conditions et notre politique de confidentialité.
          </div>
        </div>

        <footer className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} CV-IA
        </footer>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const providers = await getProviders();
  const callbackUrl = typeof ctx.query.callbackUrl === "string" ? ctx.query.callbackUrl : "/app";
  return { props: { providers, callbackUrl } };
}
