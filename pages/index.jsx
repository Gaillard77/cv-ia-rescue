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
import LetterPostal   from "../components/pdf/letters/LetterPostal";
import LetterNanica   from "../components/pdf/letters/LetterNanica";
import LetterConcept  from "../components/pdf/letters/LetterConcept";

/* =========================
   HELPERS
   ========================= */
async function fetchJSON(url, options){
  const r = await fetch(url, options);
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await r.json();
    if(!r.ok) throw new Error(data?.error || `Erreur HTTP ${r.status}`);
    return data;
  } else {
    const txt = await r.text();
    throw new Error(`Réponse non-JSON (${r.status}). Détail: ${txt.slice(0,200)}...`);
  }
}

// Préremplissage intelligent des métadonnées de lettre
function buildLetterProfileAuto(data, fallbacks = {}) {
  const p = data?.profile || {};
  const j = data?.job || {};

  const {
    cvName = "", cvTitle = "", cvEmail = "", cvPhone = "",
    cvLocation = "",
  } = fallbacks;

  const cityFromLocation = (loc) => (loc || "").split(",")[0]?.trim() || "";

  return {
    fullName:  p.fullName || cvName || p.name || "",
    title:     p.title    || cvTitle || "",
    email:     p.email    || cvEmail || "",
    phone:     p.phone    || cvPhone || "",
    location:  p.location || cvLocation || "",
    linkedin:  p.linkedin || "",

    company:         j.company        || data?.company        || "",
    recruiter:       j.recruiter      || data?.recruiter      || "",
    companyAddress:  j.address        || j.companyAddress     || data?.companyAddress || "",
    object:          j.object         || data?.object         || "",

    city:            p.city || cityFromLocation(p.location || cvLocation),
    date:            data?.date || new Date().toLocaleDateString(),
  };
}

export default function Home() {
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

  // ===== Consignes IA =====
  const [aiNote, setAiNote] = useState("");
  const [tone, setTone] = useState("professionnel"); // 👈 nouveau sélecteur de ton

  /* ========== Fichiers Upload / Extraction ========== */
  function toBase64(buf){
    let binary=""; const bytes=new Uint8Array(buf);
    for(let i=0;i<bytes.byteLength;i++) binary+=String.fromCharCode(bytes[i]);
    return typeof btoa!=="undefined" ? btoa(binary) : Buffer.from(binary,"binary").toString("base64");
  }
  async function onFile(e){
    const f = e.target.files?.[0]; if(!f) return;
    setErr(null); setExtracting(true);
    try{
      const buf = await f.arrayBuffer();
      const data = await fetchJSON("/api/extract", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ fileName: f.name, fileBase64: toBase64(buf) })
      });
      setCvText(data.text);
    }catch(e){ setErr(e.message || "Erreur d'extraction"); }
    finally{ setExtracting(false); }
  }

  function onPhotoFile(e){
    const f = e.target.files?.[0]; if(!f) return;
    if(!/^image\/(png|jpe?g)$/i.test(f.type)) { setErr("Photo: format accepté JPG/PNG"); return; }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result);
    reader.onerror = () => setErr("Impossible de lire la photo.");
    reader.readAsDataURL(f);
  }

  /* ========== Construction texte CV ========== */
  function buildBaseCVText(){
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

  /* ========== Génération CV / Lettre ========== */
  async function generateCV(){
    setLoading(true); setErr(null); setOutJSON(null);
    try{
      const baseText = buildBaseCVText();
      if(!offre || !offre.trim()) throw new Error("Ajoutez d’abord le texte de l’offre.");
      const data = await fetchJSON("/api/generate-json", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ cvText: baseText, jobText: offre })
      });
      setOutJSON(data);
    }catch(e){ setErr(e.message || "Erreur"); }
    finally{ setLoading(false); }
  }

  async function generateLetter(){
    setLoading(true); setErr(null); setOutLetter(null);
    try{
      const baseText = buildBaseCVText();
      if(!offre || !offre.trim()) throw new Error("Ajoutez d’abord le texte de l’offre.");
      const data = await fetchJSON("/api/generate-json", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ cvText: baseText, jobText: offre })
      });

      const autoProfile = buildLetterProfileAuto(data, {
        cvName, cvTitle, cvEmail, cvPhone, cvLocation,
      });

      setOutLetter({ profile: autoProfile, letter: data.letter });
    }catch(e){ setErr(e.message || "Erreur"); }
    finally{ setLoading(false); }
  }

  /* ========== Export CV / Lettre PDF ========== */
  async function exportCVPro(){
    if(!outJSON) return;
    const effectivePhoto = (photoDataUrl && photoDataUrl.startsWith("data:image")) ? photoDataUrl :
                           (photoUrl?.trim() ? photoUrl.trim() : "");
    const profile = { ...(outJSON.profile || {}), ...(effectivePhoto ? { photoUrl: effectivePhoto } : {}) };
    const props = {
      profile,
      skills: outJSON.skills || [],
      languages: outJSON.languages || [],
      hobbies: outJSON.hobbies || [],
      experiences: outJSON.experiences || [],
      education: outJSON.education || []
    };

    let Doc;
    switch (cvTemplate) {
      case "gold":  Doc = <CVGoldHeader {...props} />; break;
      case "clean": Doc = <CVCleanPro   {...props} />; break;
      case "modern":Doc = <CVProModern  {...props} />; break;
      default:       Doc = <CVDarkSidebar {...props} />;
    }

    const blob = await pdf(Doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `CV_${cvTemplate}.pdf`; a.click();
    URL.revokeObjectURL(url);
  }

  async function exportLetterPDF(){
    if(!outLetter) return;
    const baseProfile = outLetter.profile || {};
    const effectivePhoto = (photoDataUrl && photoDataUrl.startsWith("data:image")) ? photoDataUrl :
                           (photoUrl?.trim() ? photoUrl.trim() : "");
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

  /* ========== Amélioration IA ========== */
  async function improveCV(){
    if(!aiNote.trim()) { setErr("Ajoute une consigne pour l’IA."); return; }
    setLoading(true); setErr(null);
    try{
      const baseText = buildBaseCVText();
      const body = {
        cvText: baseText,
        jobText: offre || "",
        instructions: aiNote,
        tone, // 👈 ton ajouté
        currentJSON: outJSON || null,
        mode: "cv"
      };
      const data = await fetchJSON("/api/generate-json", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(body)
      });
      setOutJSON(data);
    }catch(e){ setErr(e.message || "Erreur IA (CV)"); }
    finally{ setLoading(false); }
  }

  async function improveLetter(){
    if(!aiNote.trim()) { setErr("Ajoute une consigne pour l’IA."); return; }
    if(!outLetter?.letter) { setErr("Génère d’abord la lettre, puis applique la consigne."); return; }
    setLoading(true); setErr(null);
    try{
      const body = {
        instructions: aiNote,
        tone, // 👈 ton ajouté
        currentLetter: outLetter.letter,
        currentProfile: outLetter.profile || null,
        jobText: offre || "",
        mode: "letter"
      };
      const data = await fetchJSON("/api/generate-json", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(body)
      });

      const autoProfile = buildLetterProfileAuto(data, {
        cvName, cvTitle, cvEmail, cvPhone, cvLocation,
      });
      setOutLetter({
        profile: data?.profile ? autoProfile : (outLetter.profile || autoProfile),
        letter:  data?.letter  || outLetter.letter
      });
    }catch(e){ setErr(e.message || "Erreur IA (lettre)"); }
    finally{ setLoading(false); }
  }

  /* ========== Carte Template simple ========== */
  function TemplateCard({ title, selected, onClick }){
    return (
      <button
        onClick={onClick}
        className={`rounded-xl border transition px-4 py-6 text-center
          ${selected ? "border-white bg-white/10" : "border-white/20 hover:border-white/60"}`}
      >
        <span className="font-medium">{title}</span>
      </button>
    );
  }

  /* ===========================
     RENDU PRINCIPAL
     =========================== */
  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-bg1 to-bg2">
      <div className="max-w-[1100px] w-[92vw] mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">CV-IA</h1>

        {/* --- IA : amélioration libre --- */}
        <div className="border border-white/10 rounded-2xl bg-gradient-to-b from-card1 to-card2 p-5 mt-6">
          <h2 className="text-xl font-semibold mb-2">Parler à l’IA (améliorer CV ou lettre)</h2>
          <p className="text-white/70 text-sm mb-2">
            Donne des consignes à l’IA : « rends le résumé plus percutant », « ajoute Angular », « raccourcis la lettre », etc.
          </p>

          {/* Sélecteur de ton */}
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

          {/* Zone de saisie */}
          <textarea
            className="w-full min-h-[100px] rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
            value={aiNote}
            onChange={e=>setAiNote(e.target.value)}
            placeholder="Ta consigne ici..."
          />

          <div className="flex gap-3 flex-wrap mt-3">
            <button
              className="px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 hover:brightness-110 disabled:opacity-60"
              onClick={improveCV}
              disabled={loading || (!outJSON && !cvText && !cvName && !cvTitle)}
            >
              Appliquer au CV
            </button>
            <button
              className="px-4 py-3 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 hover:brightness-110 disabled:opacity-60"
              onClick={improveLetter}
              disabled={loading || !outLetter}
            >
              Appliquer à la lettre
            </button>
          </div>
        </div>

        {/* --- ERREURS --- */}
        {err && <div className="text-red-400 mt-3">❌ {err}</div>}
      </div>
    </div>
  );
}
