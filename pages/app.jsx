// pages/app.jsx
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { pdf } from "@react-pdf/renderer";
import { getServerSession } from "next-auth/next"; // ✅ important pour SSR
import { authOptions } from "./api/auth/[...nextauth]";

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

// Préremplissage intelligent pour la lettre
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

export default function AppPage() {
  const { data: session } = useSession();

  // ===== États principaux =====
  const [cvText, setCvText] = useState("");
  const [offre, setOffre] = useState("");
  const [outJSON, setOutJSON] = useState(null);
  const [outLetter, setOutLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [extracting, setExtracting] = useState(false);

  // ===== Choix des templates =====
  const [cvTemplate, setCvTemplate] = useState("dark");
  const [letterTemplate, setLetterTemplate] = useState("nanica");

  // ===== États du formulaire minimal =====
  const [cvName, setCvName] = useState("");
  const [cvTitle, setCvTitle] = useState("");
  const [cvEmail, setCvEmail] = useState("");
  const [cvPhone, setCvPhone] = useState("");
  const [cvLocation, setCvLocation] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  const [cvSkills, setCvSkills] = useState("");
  const [cvExp, setCvExp] = useState("");
  const [cvEdu, setCvEdu] = useState("");

  // ===== Photo =====
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");

  // ===== Upload + extraction (CV fichier) =====
  function toBase64(buf) {
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null);
    setExtracting(true);
    try {
      const buf = await f.arrayBuffer();
      const data = await fetchJSON("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: f.name, fileBase64: toBase64(buf) }),
      });
      setCvText(data.text);
    } catch (e) {
      setErr(e.message || "Erreur d'extraction");
    } finally {
      setExtracting(false);
    }
  }

  // ===== Import photo locale → DataURL =====
  function onPhotoFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g)$/i.test(f.type)) {
      setErr("Photo: format accepté JPG/PNG");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result);
    reader.onerror = () => setErr("Impossible de lire la photo.");
    reader.readAsDataURL(f);
  }

  // ===== Construit un "texte CV de base" =====
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

  // ===== Génération CV (JSON via API) =====
  async function generateCV() {
    setLoading(true);
    setErr(null);
    setOutJSON(null);
    try {
      const baseText = buildBaseCVText();
      if (!offre || !offre.trim()) throw new Error("Ajoutez d’abord le texte de l’offre.");
      const data = await fetchJSON("/api/generate-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: baseText, jobText: offre }),
      });
      setOutJSON(data);
    } catch (e) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  // ===== Génération Lettre (auto via API) =====
  async function generateLetter() {
    setLoading(true);
    setErr(null);
    setOutLetter(null);
    try {
      const baseText = buildBaseCVText();
      if (!offre || !offre.trim()) throw new Error("Ajoutez d’abord le texte de l’offre.");
      const data = await fetchJSON("/api/generate-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: baseText, jobText: offre }),
      });

      const autoProfile = buildLetterProfileAuto(data, {
        cvName,
        cvTitle,
        cvEmail,
        cvPhone,
        cvLocation,
      });

      setOutLetter({ profile: autoProfile, letter: data.letter });
    } catch (e) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  // ===== Export PDF CV =====
  async function exportCVPro() {
    if (!outJSON) return;

    const effectivePhoto =
      photoDataUrl && photoDataUrl.startsWith("data:image")
        ? photoDataUrl
        : photoUrl?.trim()
        ? photoUrl.trim()
        : "";

    const profile = {
      ...(outJSON.profile || {}),
      ...(effectivePhoto ? { photoUrl: effectivePhoto } : {}),
    };

    const props = {
      profile,
      skills: outJSON.skills || [],
      languages: outJSON.languages || [],
      hobbies: outJSON.hobbies || [],
      experiences: outJSON.experiences || [],
      education: outJSON.education || [],
    };

    let Doc;
    switch (cvTemplate) {
      case "gold":
        Doc = <CVGoldHeader {...props} />;
        break;
      case "clean":
        Doc = <CVCleanPro {...props} />;
        break;
      case "modern":
        Doc = <CVProModern {...props} />;
        break;
      default:
        Doc = <CVDarkSidebar {...props} />;
    }

    const blob = await pdf(Doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_${cvTemplate}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Export PDF Lettre =====
  async function exportLetterPDF() {
    if (!outLetter) return;

    const baseProfile = outLetter.profile || {};
    const effectivePhoto =
      photoDataUrl && photoDataUrl.startsWith("data:image")
        ? photoDataUrl
        : photoUrl?.trim()
        ? photoUrl.trim()
        : "";

    const profile = { ...baseProfile, ...(effectivePhoto ? { photoUrl: effectivePhoto } : {}) };

    let Doc;
    switch (letterTemplate) {
      case "cascade":
        Doc = <LetterCascade profile={profile} letter={outLetter.letter} />;
        break;
      case "postal":
        Doc = <LetterPostal profile={profile} letter={outLetter.letter} />;
        break;
      case "concept":
        Doc = <LetterConcept profile={profile} letter={outLetter.letter} />;
        break;
      default:
        Doc = <LetterNanica profile={profile} letter={outLetter.letter} />;
    }

    const blob = await pdf(Doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lettre_${letterTemplate}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Petite carte bouton pour choisir les templates =====
  function TemplateCard({ title, selected, onClick }) {
    return (
      <button
        onClick={onClick}
        className={`rounded-xl border transition px-4 py-6 text-center ${
          selected ? "border-white bg-white/10" : "border-white/20 hover:border-white/60"
        }`}
      >
        <span className="font-medium">{title}</span>
      </button>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-bg1 to-bg2">
      <div className="max-w-[1100px] w-[92vw] mx-auto py-8">
        {/* Header — logo + titre + utilisateur + déconnexion */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shadow-soft bg-gradient-to-br from-accent to-indigo-600" />
            <h1 className="text-3xl font-bold">CV-IA</h1>
          </div>

          {session && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-white/70 hidden sm:inline">
                {session.user?.name || session.user?.email}
              </span>
              <button
                className="rounded-lg px-3 py-1.5 border border-white/20 hover:border-white/40"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>

        {/* --------- SECTION CV --------- */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Upload CV */}
          <div className="border border-white/10 rounded-2xl shadow-soft bg-gradient-to-b from-card1 to-card2 p-5">
            <label className="block text-white/70 mb-2 font-medium">Votre CV — importez un fichier</label>
            <input className="mb-2" type="file" accept=".pdf,.docx,.txt" onChange={onFile} />
            <div className="text-white/70 text-sm">
              {extracting ? "Extraction en cours…" : "Formats acceptés : PDF, DOCX, TXT"}
            </div>
          </div>

          {/* Offre */}
          <div className="border border-white/10 rounded-2xl shadow-soft bg-gradient-to-b from-card1 to-card2 p-5">
            <label className="block text-white/70 mb-2 font-medium">Offre d’emploi (texte)</label>
            <textarea
              className="w-full min-h-[160px] rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
              value={offre}
              onChange={(e) => setOffre(e.target.value)}
              placeholder="Collez ici la description du poste ciblé."
            />
            <div className="text-white/70 text-sm mt-2">Astuce : ciblez une seule offre pour un résultat pertinent.</div>
          </div>
        </div>

        {/* Formulaire minimal pour CV */}
        <div className="border border-white/10 rounded-2xl shadow-soft bg-gradient-to-b from-card1 to-card2 p-5 mt-6">
          <h2 className="text-xl font-semibold mb-4">Remplir un CV basique</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 mb-2 font-medium">Nom & Prénom</label>
              <input
                className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                value={cvName}
                onChange={(e) => setCvName(e.target.value)}
                placeholder="Ex: Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-white/70 mb-2 font-medium">Titre du poste</label>
              <input
                className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                value={cvTitle}
                onChange={(e) => setCvTitle(e.target.value)}
                placeholder="Ex: Développeur Web"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-white/70 mb-2 font-medium">Email</label>
              <input
                className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                value={cvEmail}
                onChange={(e) => setCvEmail(e.target.value)}
                placeholder="exemple@mail.com"
              />
            </div>
            <div>
              <label className="block text-white/70 mb-2 font-medium">Téléphone</label>
              <input
                className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                value={cvPhone}
                onChange={(e) => setCvPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-white/70 mb-2 font-medium">Localisation</label>
            <input
              className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
              value={cvLocation}
              onChange={(e) => setCvLocation(e.target.value)}
              placeholder="Paris, France"
            />
          </div>

          {/* Photo : URL + Upload local avec aperçu */}
          <div className="mt-4 grid md:grid-cols-[1fr,auto] items-start gap-4">
            <div>
              <label className="block text-white/70 mb-2 font-medium">URL photo (optionnel)</label>
              <input
                className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://exemple.com/ma-photo.jpg"
              />
              <div className="text-white/60 text-xs mt-1">
                Ou importez un fichier (JPG/PNG) — l’image sera intégrée au PDF.
              </div>

              <div className="mt-2">
                <input type="file" accept="image/png,image/jpeg" onChange={onPhotoFile} />
              </div>
            </div>

            {/* Aperçu photo */}
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-white/20 bg-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="aperçu photo"
                  src={photoDataUrl || photoUrl || ""}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-white/70 mb-2 font-medium">Résumé (À propos)</label>
            <textarea
              className="w-full min-h-[120px] rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
              value={cvSummary}
              onChange={(e) => setCvSummary(e.target.value)}
              placeholder="Décrivez-vous en quelques phrases..."
            />
          </div>

          <div className="mt-4">
            <label className="block text-white/70 mb-2 font-medium">Compétences (séparées par virgule)</label>
            <input
              className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
              value={cvSkills}
              onChange={(e) => setCvSkills(e.target.value)}
              placeholder="Ex: React, Node.js, SQL"
            />
          </div>

          <div className="mt-4">
            <label className="block text-white/70 mb-2 font-medium">Expériences (Poste - Entreprise - Années)</label>
            <textarea
              className="w-full min-h-[120px] rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
              value={cvExp}
              onChange={(e) => setCvExp(e.target.value)}
              placeholder="Ex: Développeur - Google - 2020/2023"
            />
          </div>

          <div className="mt-4">
            <label className="block text-white/70 mb-2 font-medium">Formation (Diplôme - École - Année)</label>
            <textarea
              className="w-full min-h-[120px] rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
              value={cvEdu}
              onChange={(e) => setCvEdu(e.target.value)}
              placeholder="Ex: Master Info - Sorbonne - 2018"
            />
          </div>

          {/* Actions CV */}
          <div className="flex gap-3 flex-wrap mt-4">
            <button
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-white bg-gradient-to-br from-accent to-indigo-600 hover:brightness-110 disabled:opacity-60"
              onClick={generateCV}
              disabled={loading || (!cvText && !cvName && !cvTitle)}
            >
              {loading ? "Génération CV…" : "Générer CV (JSON structuré)"}
            </button>
            <button
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-white bg-gradient-to-br from-emerald-400 to-emerald-600 hover:brightness-110 disabled:opacity-60"
              onClick={exportCVPro}
              disabled={!outJSON}
            >
              Exporter CV PDF
            </button>
          </div>

          {/* Sélecteur de template CV */}
          <div className="mt-4">
            <div className="text-sm text-white/70 mb-2">Mise en page :</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TemplateCard title="Modern" selected={cvTemplate === "modern"} onClick={() => setCvTemplate("modern")} />
              <TemplateCard title="Gold Header" selected={cvTemplate === "gold"} onClick={() => setCvTemplate("gold")} />
              <TemplateCard title="Dark Sidebar" selected={cvTemplate === "dark"} onClick={() => setCvTemplate("dark")} />
              <TemplateCard title="Clean Pro" selected={cvTemplate === "clean"} onClick={() => setCvTemplate("clean")} />
            </div>
          </div>
        </div>

        {/* --------- SECTION LETTRE --------- */}
        <div className="border border-white/10 rounded-2xl shadow-soft bg-gradient-to-b from-card1 to-card2 p-5 mt-6">
          <h2 className="text-xl font-semibold mb-2">Lettre de motivation</h2>
          <p className="text-white/70 text-sm">
            L’IA va générer la lettre automatiquement à partir de votre CV (upload ou formulaire) et de l’offre.
          </p>

          <div className="flex gap-3 flex-wrap mt-4">
            <button
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-white bg-gradient-to-br from-accent to-indigo-600 hover:brightness-110 disabled:opacity-60"
              onClick={generateLetter}
              disabled={loading || (!offre || (!cvText && !cvName && !cvTitle))}
            >
              {loading ? "Génération Lettre…" : "Générer la lettre automatiquement"}
            </button>
            <button
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-white bg-gradient-to-br from-pink-400 to-rose-600 hover:brightness-110 disabled:opacity-60"
              onClick={exportLetterPDF}
              disabled={!outLetter}
            >
              Exporter Lettre PDF
            </button>
          </div>

          {/* Sélecteur template Lettre */}
          <div className="mt-4">
            <div className="text-sm text-white/70 mb-2">Mise en page de la lettre :</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TemplateCard title="Cascade" selected={letterTemplate === "cascade"} onClick={() => setLetterTemplate("cascade")} />
              <TemplateCard title="Postal" selected={letterTemplate === "postal"} onClick={() => setLetterTemplate("postal")} />
              <TemplateCard title="Classique" selected={letterTemplate === "nanica"} onClick={() => setLetterTemplate("nanica")} />
              <TemplateCard title="Concept" selected={letterTemplate === "concept"} onClick={() => setLetterTemplate("concept")} />
            </div>
          </div>
        </div>

        {/* Erreurs */}
        {err && <div className="text-red-400 mt-3">❌ {err}</div>}

        {/* Aperçus (debug) */}
        {outJSON && (
          <div className="border border-white/10 rounded-2xl shadow-soft bg-gradient-to-b from-card1 to-card2 p-5 mt-4">
            <label className="block text-white/70 mb-2 font-medium">Données CV (aperçu)</label>
            <pre className="whitespace-pre-wrap m-0 p-3 rounded-xl border border-white/10 bg-[#0e1426] text-[#e9ecf6]">
{JSON.stringify(outJSON, null, 2)}
            </pre>
          </div>
        )}
        {outLetter && (
          <div className="border border-white/10 rounded-2xl shadow-soft bg-gradient-to-b from-card1 to-card2 p-5 mt-4">
            <label className="block text-white/70 mb-2 font-medium">Lettre générée (aperçu)</label>
            <pre className="whitespace-pre-wrap m-0 p-3 rounded-xl border border-white/10 bg-[#0e1426] text-[#e9ecf6]">
{outLetter.letter || ""}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== PROTECTION SERVEUR : redirige si non connecté ====== */
export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions); // ✅
  if (!session) {
    return { redirect: { destination: "/auth/signin?callbackUrl=/app", permanent: false } };
  }
  return { props: {} };
}
