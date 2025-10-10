// pages/app.jsx
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { pdf } from "@react-pdf/renderer";
import { getServerSession } from "next-auth/next"; // ✅ important
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
        cvName, cvTitle, cvEmail, cvPhone, cvLocation,
      });

      setOutLetter({ profile: autoProfile, letter: data.letter });
    } catch (e) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

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
      case "gold":  Doc = <CVGoldHeader {...props} />; break;
      case "clean": Doc = <CVCleanPro   {...props} />; break;
      case "modern":Doc = <CVProModern  {...props} />; break;
      default:      Doc = <CVDarkSidebar {...props} />;
    }

    const blob = await pdf(Doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `CV_${cvTemplate}.pdf`; a.click();
    URL.revokeObjectURL(url);
  }

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
      case "cascade": Doc = <LetterCascade profile={profile} letter={outLetter.letter} />; break;
      case "postal":  Doc = <LetterPostal  profile={profile} letter={outLetter.letter} />; break;
      case "concept": Doc = <LetterConcept profile={profile} letter={outLetter.letter} />; break;
      default:        Doc = <LetterNanica  profile={profile} letter={outLetter.letter} />;
    }

    const blob = await pdf(Doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Lettre_${letterTemplate}.pdf`; a.click();
    URL.revokeObjectURL(url);
  }

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

        {/* … ton interface existante (upload, offre, formulaires, etc.) … */}
        {/* Je laisse le reste de ton contenu tel quel */}
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
