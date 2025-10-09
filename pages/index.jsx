// pages/index.jsx
import Link from "next/link";

export default function HomeLanding() {
  return (
    <>
      <main className="container">
        <section className="hero">
          <div>
            <div className="pill">Nouveau — Optimisé ATS</div>
            <h1>
              Boostez vos candidatures en{" "}
              <span className="accent2">30 secondes</span>
            </h1>
            <p className="muted">
              Importez votre CV, collez l&apos;offre d&apos;emploi et obtenez
              un CV optimisé ATS, une lettre et une checklist d&apos;entretien.
            </p>

            {/* Boutons d'action */}
            <div className="ctaRow">
              {/* Lien vers TON APP (désormais /app) */}
              <Link href="/app" className="btn primary">
                Démarrer gratuitement
              </Link>

              {/* Lien vers Google Form (ouvre un nouvel onglet) */}
              <a
                className="btn outline"
                href="LINK_GOOGLE_FORM"
                target="_blank"
                rel="noopener"
              >
                Rejoindre la liste d’attente
              </a>
            </div>

            <p className="note">
              Astuce : si tu veux une inscription intégrée, utilise aussi
              l&apos;iframe à droite.
            </p>
          </div>

          <div>
            <div className="card">
              <h3>Inscription intégrée (iframe)</h3>
              {/* Remplacez l’URL par le code d’intégration Forms (menu « Envoyer » > onglet <> ) */}
              <iframe
                src="LINK_GOOGLE_FORM_EMBED"
                title="Inscription"
              >
                Chargement du formulaire…
              </iframe>
              <p className="note">
                Dans Google Forms : Envoyer → onglet &lt;&gt; → copiez l&apos;URL
                d&apos;intégration, collez-la ici.
              </p>
            </div>
          </div>
        </section>

        {/* Bandeau de confiance (facultatif) */}
        <section className="trust">
          <div className="trustCard">
            <h4>Pourquoi CV-IA ?</h4>
            <ul>
              <li>⚡ Génération en quelques secondes</li>
              <li>✅ Optimisé ATS (mots-clés, structure)</li>
              <li>🧠 Lettre de motivation cohérente et concise</li>
              <li>📄 Export PDF multi-templates</li>
            </ul>
            <Link href="/app" className="btn slim">
              Essayer maintenant →
            </Link>
          </div>
        </section>
      </main>

      {/* Styles (inspirés de ton index (4).html) */}
      <style jsx>{`
        :root {
          --bg: #0b0f19;
          --card: #121829;
          --muted: #9aa5b1;
          --text: #e6e9ef;
          --accent: #7c5cff;
          --accent2: #4dd4ac;
          --border: rgba(255, 255, 255, 0.08);
        }
        :global(html, body) {
          margin: 0;
          height: 100%;
          background: linear-gradient(180deg, #0b0f19, #0a0d15 60%, #080b12);
          color: var(--text);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            sans-serif;
        }
        .container {
          width: min(1000px, 92vw);
          margin: 0 auto;
          padding: 40px 0 64px;
        }
        .hero {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 28px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
          }
        }
        h1 {
          font-size: clamp(28px, 4.2vw, 56px);
          line-height: 1.05;
          margin: 12px 0 10px;
        }
        .accent2 {
          color: var(--accent2);
        }
        .muted {
          color: var(--muted);
        }
        .pill {
          display: inline-block;
          padding: 6px 10px;
          border: 1px solid rgba(124, 92, 255, 0.35);
          border-radius: 999px;
          background: rgba(124, 92, 255, 0.14);
          font-size: 13px;
        }
        .ctaRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin: 14px 0 6px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          border: 1px solid transparent;
        }
        .btn.primary {
          background: linear-gradient(135deg, var(--accent), #5a3cff);
          color: white;
        }
        .btn.outline {
          border-color: rgba(255, 255, 255, 0.18);
          background: transparent;
          color: var(--text);
        }
        .btn.slim {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: rgba(124, 92, 255, 0.12);
          color: white;
          font-weight: 600;
        }
        .card {
          background: linear-gradient(180deg, #121829, #0f1526);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 18px;
        }
        .card h3 {
          margin: 0 0 8px;
        }
        iframe {
          width: 100%;
          height: 520px;
          border: 0;
          border-radius: 10px;
          background: #0f1526;
        }
        .note {
          margin-top: 10px;
          color: var(--muted);
          font-size: 14px;
        }
        .trust {
          margin-top: 32px;
        }
        .trustCard {
          background: linear-gradient(180deg, #121829, #0f1526);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px;
        }
        .trustCard h4 {
          margin: 0 0 10px;
        }
        .trustCard ul {
          margin: 0 0 14px 16px;
          padding: 0;
          color: var(--muted);
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}
