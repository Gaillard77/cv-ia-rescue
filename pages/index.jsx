// pages/index.jsx
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";

// Templates PDF CV
import CVProModern from "../components/pdf/CVProModern";
import CVGoldHeader from "../components/pdf/CVGoldHeader";
import CVDarkSidebar from "../components/pdf/CVDarkSidebar";
import CVCleanPro from "../components/pdf/CVCleanPro";

// Templates PDF LETTRE
import LetterCascade from "../components/pdf/letters/LetterCascade";
import LetterPostal from "../components/pdf/letters/LetterPostal";
import LetterNanica from "../components/pdf/letters/LetterNanica";
import LetterConcept from "../components/pdf/letters/LetterConcept";

/* =========================
   HELPERS
   ========================= */
async function fetchJSON(url, options) {
  const r = await fetch(url, options);
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error || `Erreur HTTP ${r.status}`);
    return data;
  } else {
    const txt = await r.text();
    throw new Error(`Réponse non-JSON (${r.status}). Détail: ${txt.slice(0, 200)}...`);
  }
}

function buildLetterProfileAuto(data, fallbacks = {}) {
  const p = data?.profile || {};
  const j = data?.job || {};
  const { cvName = "", cvTitle = "", cvEmail = "", cvPhone = "", cvLocation = "" } = fallbacks;
  const cityFromLocation = (loc) => (loc || "").split(",")[0]?.trim() || "";
  return {
    fullName: p.fullName || cvName || p.name || "",
    title: p.title || cvTitle || "",
    email: p.email || cvEmail || "",
    phone: p.phone || cvPhone || "",
    location: p.location || cvLocation || "",
    linkedin: p.linkedin || "",
    company: j.company || data?.company || "",
    recruiter: j.recruiter || data?.recruiter || "",
    companyAddress: j.address || j.companyAddress || data?.companyAddress || "",
    object: j.object || data?.object || "",
    city: p.city || cityFromLocation(p.location || cvLocation),
    date: data?.date || new Date().toLocaleDateString(),
  };
}

/* ======== Fonction pour comparer les textes avant/après ======== */
function analyzeChanges(oldText = "", newText = "") {
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);
  const added = newWords.filter((w) => !oldWords.includes(w));
  const removed = oldWords.filter((w) => !newWords.includes(w));

  let summary = "";
  if (added.length > 0) summary += `🟢 ${added.length} mots ajoutés (${added.slice(0, 6).join(", ")}...). `;
  if (removed.length > 0) summary += `🔴 ${removed.length} mots supprimés (${removed.slice(0, 6).join(", ")}...). `;
  if (Math.abs(newText.length - oldText.length) < 50)
    summary += "✏️ Quelques reformulations mineures. ";
  else if (newText.length > oldText.length)
    summary += "📈 Texte enrichi. ";
  else
    summary += "📉 Texte condensé. ";

  return summary.trim();
}

/* =========================
   COMPOSANT PRINCIPAL
   ========================= */
export default function Home() {
  const [cvText, setCvText] = useState("");
  const [offre, setOffre] = useState("");
  const [outJSON, setOutJSON] = useState(null);
  const [outLetter, setOutLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [aiNote, setAiNote] = useState("");
  const [tone, setTone] = useState("professionnel");
  const [aiSummary, setAiSummary] = useState("");

  // Données CV simples
  const [cvName, setCvName] = useState("");
  const [cvTitle, setCvTitle] = useState("");
  const [cvEmail, setCvEmail] = useState("");
  const [cvPhone, setCvPhone] = useState("");
  const [cvLocation, setCvLocation] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  const [cvSkills, setCvSkills] = useState("");
  const [cvExp, setCvExp] = useState("");
  const [cvEdu, setCvEdu] = useState("");

  function buildBaseCVText() {
    if (cvText && cvText.trim()) return cvText.trim();
    return `
Nom: ${cvName || ""}
Titre: ${cvTitle || ""}
Email: ${cvEmail || ""}
Téléphone: ${cvPhone || ""}
Lieu: ${cvLocation || ""}
Résumé: ${cvSummary || ""}

Compétences: ${cvSkills || ""}

Expériences:
${cvExp || ""}

Formation:
${cvEdu || ""}
`.trim();
  }

  /* ======== Amélioration IA avec résumé ======== */
  async function improveCV() {
    if (!aiNote.trim()) return setErr("Ajoute une consigne pour l’IA.");
    setLoading(true);
    setErr(null);
    setAiSummary("");
    try {
      const oldText = JSON.stringify(outJSON, null, 2);
      const baseText = buildBaseCVText();
      const data = await fetchJSON("/api/generate-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: baseText,
          jobText: offre || "",
          instructions: aiNote,
          tone,
          currentJSON: outJSON || null,
          mode: "cv",
        }),
      });

      setOutJSON(data);
      const newText = JSON.stringify(data, null, 2);
      const diff = analyzeChanges(oldText, newText);

      setAiSummary(`✅ CV mis à jour (ton ${tone}). ${diff}`);
    } catch (e) {
      setErr(e.message || "Erreur IA (CV)");
    } finally {
      setLoading(false);
    }
  }

  async function improveLetter() {
    if (!aiNote.trim()) return setErr("Ajoute une consigne pour l’IA.");
    if (!outLetter?.letter) return setErr("Génère d’abord la lettre, puis applique la consigne.");
    setLoading(true);
    setErr(null);
    setAiSummary("");
    try {
      const oldLetter = outLetter.letter;
      const data = await fetchJSON("/api/generate-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructions: aiNote,
          tone,
          currentLetter: outLetter.letter,
          currentProfile: outLetter.profile || null,
          jobText: offre || "",
          mode: "letter",
        }),
      });

      const autoProfile = buildLetterProfileAuto(data, {
        cvName,
        cvTitle,
        cvEmail,
        cvPhone,
        cvLocation,
      });

      setOutLetter({
        profile: data?.profile ? autoProfile : outLetter.profile,
        letter: data?.letter || outLetter.letter,
      });

      const diff = analyzeChanges(oldLetter, data?.letter || "");
      setAiSummary(`✅ Lettre ajustée (ton ${tone}). ${diff}`);
    } catch (e) {
      setErr(e.message || "Erreur IA (lettre)");
    } finally {
      setLoading(false);
    }
  }

  /* ======== Interface ======== */
  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-bg1 to-bg2">
      <div className="max-w-[1100px] w-[92vw] mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">CV-IA</h1>

        {/* --- IA --- */}
        <div className="border border-white/10 rounded-2xl bg-gradient-to-b from-card1 to-card2 p-5 mt-6">
          <h2 className="text-xl font-semibold mb-2">Parler à l’IA</h2>
          <p className="text-white/70 text-sm mb-2">
            Donne des consignes à l’IA : « rends le résumé plus percutant », « ajoute Angular », «
            raccourcis la lettre », etc.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-white/70 text-sm">Ton souhaité :</span>
            {["professionnel", "convaincant", "créatif", "académique", "concis"].map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 text-sm rounded-full border transition ${
                  tone === t
                    ? "bg-indigo-600 border-indigo-400"
                    : "border-white/30 hover:border-indigo-300"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <textarea
            className="w-full min-h-[100px] rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
            value={aiNote}
            onChange={(e) => setAiNote(e.target.value)}
            placeholder="Ta consigne ici..."
          />

          <div className="flex gap-3 flex-wrap mt-3">
            <button
              className="px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 hover:brightness-110 disabled:opacity-60"
              onClick={improveCV}
              disabled={loading}
            >
              Appliquer au CV
            </button>
            <button
              className="px-4 py-3 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 hover:brightness-110 disabled:opacity-60"
              onClick={improveLetter}
              disabled={loading}
            >
              Appliquer à la lettre
            </button>
          </div>

          {aiSummary && (
            <div className="mt-4 text-sm border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 p-3 rounded-xl">
              {aiSummary}
            </div>
          )}
        </div>

        {err && <div className="text-red-400 mt-3">❌ {err}</div>}
      </div>
    </div>
  );
}
