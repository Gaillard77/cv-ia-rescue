// pages/auth/signin.jsx
import { getProviders, signIn } from "next-auth/react";
import Link from "next/link";

export default function SignIn({ providers }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-gray-800/40 to-gray-900/60 shadow-[0_10px_35px_rgba(0,0,0,.5)]">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600" />
          <h1 className="text-xl font-bold">CV-IA</h1>
        </div>

        <h2 className="text-2xl font-semibold mb-1">Connexion</h2>
        <p className="text-white/70 text-sm mb-5">
          Connecte-toi pour accéder à l’atelier CV & Lettre.
        </p>

        {/* Credentials */}
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const email = e.currentTarget.email.value;
            const password = e.currentTarget.password.value;
            await signIn("credentials", { email, password, callbackUrl: "/app" });
          }}
        >
          <input name="email" type="email" required placeholder="Email"
                 className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2" />
          <input name="password" type="password" required placeholder="Mot de passe"
                 className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2" />
          <button type="submit"
                  className="w-full rounded-xl px-4 py-2.5 font-semibold bg-gradient-to-br from-indigo-500 to-violet-600 hover:brightness-110">
            Se connecter
          </button>
        </form>

        {/* Providers OAuth (optionnel) */}
        <div className="mt-4 space-y-2">
          {Object.values(providers)
            .filter((p) => p.id !== "credentials")
            .map((provider) => (
              <button
                key={provider.name}
                onClick={() => signIn(provider.id, { callbackUrl: "/app" })}
                className="w-full rounded-xl px-4 py-2.5 font-semibold border border-white/15 hover:border-indigo-400/50"
              >
                Continuer avec {provider.name}
              </button>
            ))}
        </div>

        <div className="mt-5 text-sm text-white/70 flex items-center justify-between">
          <Link href="/" className="hover:text-white">← Retour à l’accueil</Link>
          <Link href="/auth/signup" className="hover:text-white">Créer un compte</Link>
        </div>

        <div className="text-center text-xs text-white/50 mt-6">
          © {new Date().getFullYear()} CV-IA
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return { props: { providers: providers || {} } };
}
