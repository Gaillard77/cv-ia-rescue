// pages/index.jsx
import Link from "next/link";

const Pill = ({ children }) => (
  <span className="inline-block text-xs md:text-sm px-3 py-1 rounded-full border border-indigo-400/40 bg-indigo-400/10 text-indigo-100">
    {children}
  </span>
);

const Card = ({ title, children, className = "" }) => (
  <div
    className={`rounded-2xl border border-white/10 bg-gradient-to-b from-gray-800/40 to-gray-900/60 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${className}`}
  >
    {title && <h3 className="text-base md:text-lg font-semibold mb-2">{title}</h3>}
    <div className="text-white/70 text-sm leading-relaxed">{children}</div>
  </div>
);

const PricingCard = ({ badge, price, plan, features = [], ctaText, href, highlight }) => (
  <div
    className={`rounded-2xl border p-5 md:p-6 bg-gradient-to-b from-gray-800/40 to-gray-900/60 shadow-[0_10px_28px_rgba(0,0,0,0.35)] ${
      highlight ? "border-indigo-300/50" : "border-white/10"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="text-white/80 font-medium">{plan}</div>
      {badge && (
        <span className="text-[10px] px-2 py-1 rounded-full border border-white/15 text-white/70">
          {badge}
        </span>
      )}
    </div>
    <div className="text-3xl font-extrabold mb-3">{price}</div>
    <ul className="text-white/70 text-sm space-y-1 mb-4 list-disc pl-5">
      {features.map((f, i) => (
        <li key={i}>{f}</li>
      ))}
    </ul>
    {href ? (
      <Link
        href={href}
        className={`inline-flex items-center justify-center w-full rounded-xl px-4 py-2.5 text-sm font-semibold ${
          highlight
            ? "bg-gradient-to-br from-indigo-500 to-violet-600 hover:brightness-110"
            : "border border-white/20 hover:border-indigo-400/50"
        }`}
      >
        {ctaText}
      </Link>
    ) : (
      <button
        className={`inline-flex items-center justify-center w-full rounded-xl px-4 py-2.5 text-sm font-semibold ${
          highlight
            ? "bg-gradient-to-br from-indigo-500 to-violet-600 hover:brightness-110"
            : "border border-white/20 hover:border-indigo-400/50"
        }`}
      >
        {ctaText}
      </button>
    )}
  </div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-[#0b0f19]/70 bg-[#0b0f19]/90 border-b border-white/10">
        <div className="mx-auto w-[92vw] max-w-6xl h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow" />
            <span className="font-bold">CV-IA</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-sm text-white/70">
            <a href="#features" className="hover:text-white">Fonctionnalités</a>
            <a href="#how" className="hover:text-white">Comment ça marche</a>
            <a href="#tarifs" className="hover:text-white">Tarifs</a>
            <Link
              href="/app"
              className="ml-2 rounded-lg px-3 py-1.5 bg-gradient-to-br from-indigo-500 to-violet-600 hover:brightness-110 text-sm font-semibold"
            >
              Ouvrir l’app
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(99,102,241,0.25),transparent_60%)] pointer-events-none" />
        <div className="mx-auto w-[92vw] max-w-6xl pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="grid md:grid-cols-[1.15fr,0.85fr] gap-8 md:gap-10 items-start">
            {/* left */}
            <div>
              <div className="mb-3">
                <Pill>Nouveau — Optimisé ATS • Lettre & Checklists incluses</Pill>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.05]">
                Boostez vos
                <br />
                candidatures en{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  30 secondes
                </span>
              </h1>
              <p className="text-white/70 mt-4 max-w-xl">
                Importez votre CV, collez l’offre d’emploi et obtenez un CV optimisé ATS, une
                lettre de motivation personnalisée et une checklist d’entretien.
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <Link
                  href="/app"
                  className="rounded-xl px-5 py-3 font-semibold bg-gradient-to-br from-indigo-500 to-violet-600 hover:brightness-110 shadow-[0_10px_30px_rgba(99,102,241,.35)]"
                >
                  Commencer
                </Link>
                <a
                  href="#tarifs"
                  className="rounded-xl px-5 py-3 font-semibold border border-white/15 hover:border-indigo-400/50"
                >
                  Rejoindre la bêta
                </a>
              </div>
              <div className="text-white/50 text-xs mt-3">
                Gratuit pendant la bêta • Annulable à tout moment
              </div>

              {/* features */}
              <div id="features" className="grid sm:grid-cols-3 gap-3 mt-8">
                <Card title="CV adapté à chaque offre">
                  Ciblage par mots-clés et format compatible ATS pour passer les filtres.
                </Card>
                <Card title="Lettre en 1 clic">
                  Génération instantanée d’une lettre personnalisée, prête à signer.
                </Card>
                <Card title="Préparation entretien">
                  Questions probables et checklist des points à valider.
                </Card>
              </div>
            </div>

            {/* right steps */}
            <div className="space-y-3">
              <Card title="1) Importez votre CV">
                PDF ou Word — détection auto des compétences et expériences clés.
              </Card>
              <Card title="2) Collez l’offre d’emploi">
                Intégration LinkedIn/Indeed ou copier-coller de la description.
              </Card>
              <Card title="3) Recevez vos documents">
                CV optimisé, lettre et checklist — export PDF immédiat.
              </Card>
            </div>
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto w-[92vw] max-w-6xl py-6 md:py-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Comment ça marche</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Analyse ATS">
            Extraction des mots-clés de l’offre pour maximiser le matching.
          </Card>
          <Card title="Personnalisation intelligente">
            Réécriture du CV et de la lettre pour refléter l’impact et la pertinence.
          </Card>
          <Card title="Qualité vérifiée">
            Score de compatibilité et recommandations concrètes avant export.
          </Card>
        </div>
      </section>

      {/* PRICING */}
      <section id="tarifs" className="mx-auto w-[92vw] max-w-6xl py-6 md:py-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Tarifs simples</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <PricingCard
            plan="Gratuit"
            badge="Beta"
            price="0€"
            features={["CV-IA", "Lettre + Checklist", "Export PDF"]}
            ctaText="Commencer"
            href="/app"
          />
          <PricingCard
            plan="Pro"
            badge="Recommandé"
            price="12€/mois"
            features={["Illimité", "Templates premium", "Historique & suivis"]}
            ctaText="Passer en Pro"
            href="/app"
            highlight
          />
          <PricingCard
            plan="Coach+"
            price="49€/mois"
            features={["Pro +", "Review humain", "Priorité support"]}
            ctaText="Contacter"
          />
        </div>
      </section>

      {/* ✅ TÉMOIGNAGES */}
      <section className="mx-auto w-[92vw] max-w-6xl py-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">Ils ont testé CV-IA</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <Card className="text-center">
            <p className="italic mb-3">
              “En 5 minutes j’ai eu un CV et une lettre prêts à envoyer. J’ai obtenu une réponse positive dès la première semaine !”
            </p>
            <div className="text-white font-medium">— Sarah L.</div>
            <div className="text-white/50 text-sm">Étudiante en marketing</div>
          </Card>
          <Card className="text-center">
            <p className="italic mb-3">
              “L’analyse ATS m’a permis de comprendre pourquoi mon CV était rejeté. CV-IA l’a corrigé automatiquement.”
            </p>
            <div className="text-white font-medium">— Julien P.</div>
            <div className="text-white/50 text-sm">Développeur web</div>
          </Card>
          <Card className="text-center">
            <p className="italic mb-3">
              “Très pratique et rapide. Les lettres sont claires et percutantes. On sent que c’est pensé pour les vrais candidats.”
            </p>
            <div className="text-white font-medium">— Marie T.</div>
            <div className="text-white/50 text-sm">RH en reconversion</div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-[92vw] max-w-6xl py-6 md:py-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">FAQ</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Est-ce compatible ATS ?">
            Oui. La mise en forme et les sections respectent les standards des parseurs ATS.
          </Card>
          <Card title="Mes données sont-elles sécurisées ?">
            Vos fichiers restent privés. Vous pouvez supprimer votre contenu à tout moment.
          </Card>
          <Card title="Puis-je annuler ?">
            Bien sûr, à tout moment, en un clic depuis votre tableau de bord.
          </Card>
          <Card title="Langues supportées ?">
            Français et anglais au lancement. D’autres langues à venir.
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto w-[92vw] max-w-6xl py-10 text-center text-white/50 text-sm">
        © {new Date().getFullYear()} CV-IA — Fait avec ❤️ pour les candidats
      </footer>
    </div>
  );
}
