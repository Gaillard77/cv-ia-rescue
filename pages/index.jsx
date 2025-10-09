// pages/index.jsx
import Link from "next/link";

export default function HomeLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg1 to-bg2 text-white flex flex-col justify-center items-center px-6">
      {/* Conteneur principal */}
      <div className="max-w-3xl text-center space-y-6">
        {/* Logo / titre */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-indigo-600 shadow-lg" />
          <h1 className="text-4xl font-bold">Bienvenue sur CV-IA</h1>
          <p className="text-white/70 max-w-lg">
            Génère ton CV et ta lettre de motivation avec l’IA — optimisés pour les recruteurs et exportables en PDF multi-templates.
          </p>
        </div>

        {/* Boutons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/app"
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 hover:brightness-110 font-semibold shadow-soft"
          >
            🚀 Démarrer gratuitement
          </Link>
          <a
            href="https://forms.gle/tonLienGoogleForm"
            target="_blank"
            rel="noopener"
            className="px-6 py-3 rounded-xl border border-white/20 hover:border-indigo-400/50 font-semibold"
          >
            📝 Rejoindre la liste d’attente
          </a>
        </div>

        {/* Avantages */}
        <div className="grid sm:grid-cols-2 gap-4 mt-10 text-left">
          <div className="border border-white/10 rounded-2xl bg-gradient-to-b from-card1 to-card2 p-5">
            <h3 className="font-semibold text-lg mb-2">⚡ Génération instantanée</h3>
            <p className="text-white/70 text-sm">Colle ton offre d’emploi et reçois un CV structuré et une lettre personnalisée.</p>
          </div>
          <div className="border border-white/10 rounded-2xl bg-gradient-to-b from-card1 to-card2 p-5">
            <h3 className="font-semibold text-lg mb-2">📄 PDF multi-templates</h3>
            <p className="text-white/70 text-sm">Choisis entre plusieurs styles modernes et exporte ton CV ou ta lettre en un clic.</p>
          </div>
          <div className="border border-white/10 rounded-2xl bg-gradient-to-b from-card1 to-card2 p-5">
            <h3 className="font-semibold text-lg mb-2">🧠 IA personnalisée</h3>
            <p className="text-white/70 text-sm">Améliore ton contenu avec des consignes précises : ton professionnel, créatif, etc.</p>
          </div>
          <div className="border border-white/10 rounded-2xl bg-gradient-to-b from-card1 to-card2 p-5">
            <h3 className="font-semibold text-lg mb-2">💼 Prêt pour le recrutement</h3>
            <p className="text-white/70 text-sm">Optimisé ATS : structure claire, mots-clés, et compatibilité avec les plateformes RH.</p>
          </div>
        </div>

        {/* Footer simple */}
        <div className="text-white/50 text-sm mt-8">
          © {new Date().getFullYear()} CV-IA — Créé avec ❤️ pour booster vos candidatures
        </div>
      </div>
    </div>
  );
}
