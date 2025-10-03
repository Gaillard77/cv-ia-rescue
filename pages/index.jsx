// pages/index.jsx
import { useState } from "react";
import { pdf, Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

// Templates PDF CV
import CVProModern from "../components/pdf/CVProModern";
import CVGoldHeader from "../components/pdf/CVGoldHeader";
import CVDarkSidebar from "../components/pdf/CVDarkSidebar";
import CVCleanPro from "../components/pdf/CVCleanPro";

// --- Fallbacks intégrés (si pas d'images dans /public/templates) ---
const PREVIEW_SVGS = {
  modern: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='120'><rect width='100%' height='100%' fill='white'/><text x='10' y='60' font-size='20' fill='black'>Modern</text></svg>",
  gold: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='120'><rect width='100%' height='100%' fill='gold'/><text x='10' y='60' font-size='20' fill='black'>Gold</text></svg>",
  dark: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='120'><rect width='100%' height='100%' fill='black'/><text x='10' y='60' font-size='20' fill='white'>Dark</text></svg>",
  clean: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='120'><rect width='100%' height='100%' fill='lightgray'/><text x='10' y='60' font-size='20' fill='black'>Clean</text></svg>"
};

// --- Composant PDF pour la Lettre ---
const letterStyles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Helvetica" },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#0e1a2b" },
  meta: { fontSize: 10, color: "#4d5e78", marginBottom: 10 },
  body: { fontSize: 11, lineHeight: 1.6, color: "#222" },
  sign: { fontSize: 11, marginTop: 18 }
});
function LetterPDF({ profile = {}, letter = "" }) {
  return (
    <Document>
      <Page size="A4" style={letterStyles.page}>
        <Text style={letterStyles.h1}>Lettre de motivation</Text>
        <Text style={letterStyles.meta}>
          {(profile.fullName || "") +
            (profile.email ? ` • ${profile.email}` : "") +
            (profile.phone ? ` • ${profile.phone}` : "") +
            (profile.location ? ` • ${profile.location}` : "")}
        </Text>
        <Text style={letterStyles.body}>{letter}</Text>
        <Text style={letterStyles.sign}>
          Cordialement,{`\n`}{profile.fullName || ""}
        </Text>
      </Page>
    </Document>
  );
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

  // ===== Choix du template =====
  const [cvTemplate, setCvTemplate] = useState("dark");

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

  // ===== Utils upload fichier CV =====
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
      const r = await fetch("/api/extract", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ fileName: f.name, fileBase64: toBase64(buf) })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data?.error || "Extraction échouée");
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

  async function generateCV(){
    setLoading(true); setErr(null); setOutJSON(null);
    try{
      const baseText = buildBaseCVText();
      if(!offre || !offre.trim()) throw new Error("Ajoutez d’abord le texte de l’offre.");
      const r = await fetch("/api/generate-json", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ cvText: baseText, jobText: offre })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data?.error || "Erreur serveur");
      setOutJSON(data);
    }catch(e){ setErr(e.message || "Erreur"); }
    finally{ setLoading(false); }
  }

  async function generateLetter(){
    setLoading(true); setErr(null); setOutLetter(null);
    try{
      const baseText = buildBaseCVText();
      if(!offre || !offre.trim()) throw new Error("Ajoutez d’abord le texte de l’offre.");
      const r = await fetch("/api/generate-json", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ cvText: baseText, jobText: offre })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data?.error || "Erreur serveur");
      setOutLetter({ profile: data.profile, letter: data.letter });
    }catch(e){ setErr(e.message || "Erreur"); }
    finally{ setLoading(false); }
  }

  async function exportCVPro(){
    if(!outJSON) return;
    const effectivePhoto = (photoDataUrl && photoDataUrl.startsWith("data:image")) ? photoDataUrl :
                           (photoUrl?.trim() ? photoUrl.trim() : "");
    const profile = {
      ...(outJSON.profile || {}),
      ...(effectivePhoto ? { photoUrl: effectivePhoto } : {})
    };
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
      case "gold": Doc = <CVGoldHeader {...props} />; break;
      case "clean": Doc = <CVCleanPro {...props} />; break;
      case "modern": Doc = <CVProModern {...props} />; break;
      case "dark":
      default: Doc = <CVDarkSidebar {...props} />;
    }
    const blob = await pdf(Doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `CV_${cvTemplate}.pdf`; a.click();
    URL.revokeObjectURL(url);
  }

  async function exportLetterPDF(){
    if(!outLetter) return;
    const effectivePhoto = (photoDataUrl && photoDataUrl.startsWith("data:image")) ? photoDataUrl :
                           (photoUrl?.trim() ? photoUrl.trim() : "");
    const profile = {
      ...(outLetter.profile || {}),
      ...(effectivePhoto ? { photoUrl: effectivePhoto } : {})
    };
    const blob = await pdf(<LetterPDF profile={profile} letter={outLetter.letter} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Lettre_de_motivation.pdf"; a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Carte Template (corrigée avec fallback) =====
  function TemplateCard({ id, title, img, selected, onClick }){
    const fallback = PREVIEW_SVGS[id];
    return (
      <button
        onClick={onClick}
        className={`group relative overflow-hidden rounded-xl border ${selected ? "border-white" : "border-white/20"} hover:border-white/60 transition`}
        title={title}
      >
        <div className="w-[180px] h-[120px] bg-white/5 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img || fallback}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e)=>{ e.currentTarget.src = fallback; }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs">{title}</div>
        {selected && <div className="absolute inset-0 ring-2 ring-white/80 pointer-events-none rounded-xl" />}
      </button>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-bg1 to-bg2">
      <div className="max-w-[1100px] w-[92vw] mx-auto py-8">
        {/* ... garde le reste de ton JSX ici (formulaires, boutons, etc.) */}
      </div>
    </div>
  );
}
