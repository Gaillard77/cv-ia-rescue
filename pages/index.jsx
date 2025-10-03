// pages/index.jsx
import { useState } from "react";
import { pdf, Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

// Templates PDF CV
import CVProModern from "../components/pdf/CVProModern";
import CVGoldHeader from "../components/pdf/CVGoldHeader";
import CVDarkSidebar from "../components/pdf/CVDarkSidebar";
import CVCleanPro from "../components/pdf/CVCleanPro";

// Fallbacks intégrés (prévisualisations sans /public/)
const PREVIEW_SVGS = {
  modern: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='120'><rect width='100%' height='100%' fill='white'/><text x='10' y='60' font-size='20' fill='black'>Modern</text></svg>",
  gold: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='120'><rect width='100%' height='100%' fill='gold'/><text x='10' y='60' font-size='20' fill='black'>Gold</text></svg>",
  dark: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='120'><rect width='100%' height='100%' fill='black'/><text x='10' y='60' font-size='20' fill='white'>Dark</text></svg>",
  clean: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='120'><rect width='100%' height='100%' fill='lightgray'/><text x='10' y='60' font-size='20' fill='black'>Clean</text></svg>"
};

/* =========================
   VIGNETTES INTÉGRÉES (fallback)
   ========================= */
const PREVIEW_SVGS = {
  modern: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='600' height='800'>
      <rect width='100%' height='100%' fill='#ffffff'/>
      <rect x='0' y='0' width='600' height='120' fill='#eef2ff'/>
      <text x='30' y='60' font-size='42' fill='#1f2937' font-family='Arial'>Jean Dupont</text>
      <text x='30' y='100' font-size='24' fill='#374151' font-family='Arial'>Développeur Full-Stack</text>
      <line x1='300' y1='130' x2='300' y2='760' stroke='#e5e7eb' stroke-width='3'/>
      <text x='30' y='170' font-size='24' fill='#111827' font-family='Arial'>COMPÉTENCES</text>
      <text x='30' y='205' font-size='18' fill='#374151' font-family='Arial'>• React • Node.js • SQL • Docker • AWS</text>
      <text x='330' y='170' font-size='24' fill='#111827' font-family='Arial'>EXPÉRIENCES</text>
      <text x='330' y='205' font-size='18' fill='#374151' font-family='Arial'>TechCorp (2022–2024) • StartApp (2019–2022)</text>
    </svg>
  `)}`,
  gold: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='600' height='800'>
      <rect width='100%' height='100%' fill='#ffffff'/>
      <rect x='0' y='0' width='600' height='140' fill='#c8a75a'/>
      <circle cx='80' cy='70' r='50' fill='#f3f4f6' stroke='#b58943' stroke-width='4'/>
      <text x='170' y='60' font-size='42' fill='#1f2937' font-family='Arial'>Jean Dupont</text>
      <text x='170' y='100' font-size='24' fill='#1f2937' font-family='Arial'>Product Manager</text>
      <text x='30' y='190' font-size='24' fill='#111827' font-family='Arial'>OBJECTIFS</text>
      <text x='30' y='225' font-size='18' fill='#374151' font-family='Arial'>Stratégie produit orientée KPI & impact.</text>
      <text x='330' y='190' font-size='24' fill='#111827' font-family='Arial'>EXPÉRIENCES</text>
      <text x='330' y='225' font-size='18' fill='#374151' font-family='Arial'>FinTech (2021–2024) • Lancements majeurs</text>
    </svg>
  `)}`,
  dark: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='600' height='800'>
      <rect width='100%' height='100%' fill='#ffffff'/>
      <rect x='0' y='0' width='200' height='800' fill='#1f2937'/>
      <circle cx='100' cy='100' r='60' fill='#0f172a'/>
      <text x='30' y='190' font-size='20' fill='#e5e7eb' font-family='Arial'>Jean Dupont</text>
      <text x='30' y='215' font-size='16' fill='#c7d2fe' font-family='Arial'>Data Analyst</text>
      <line x1='20' y1='235' x2='180' y2='235' stroke='#374151' stroke-width='2'/>
      <text x='220' y='60' font-size='24' fill='#111827' font-family='Arial'>PROFIL</text>
      <text x='220' y='90' font-size='18' fill='#374151' font-family='Arial'>Dashboards, AB tests, SQL/Python.</text>
      <text x='220' y='140' font-size='24' fill='#111827' font-family='Arial'>EXPÉRIENCES</text>
      <text x='220' y='170' font-size='18' fill='#374151' font-family='Arial'>RetailCo (2022–2024) • Segmentation clients</text>
    </svg>
  `)}`,
  clean: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='600' height='800'>
      <rect width='100%' height='100%' fill='#ffffff'/>
      <line x1='30' y1='70' x2='570' y2='70' stroke='#111111' stroke-width='3'/>
      <text x='30' y='45' font-size='42' fill='#111111' font-family='Arial'>JEAN DUPONT</text>
      <text x='360' y='45' font-size='24' fill='#111111' font-family='Arial'>Développeur</text>
      <text x='30' y='120' font-size='24' fill='#111111' font-family='Arial'>PROFIL</text>
      <text x='30' y='150' font-size='18' fill='#000000' font-family='Arial'>Code propre, tests, performance.</text>
      <text x='340' y='120' font-size='24' fill='#111111' font-family='Arial'>COMPÉTENCES</text>
      <text x='340' y='150' font-size='18' fill='#000000' font-family='Arial'>JS • TS • React • Node • SQL</text>
    </svg>
  `)}`
};

/* =========================
   COMPOSANT LETTRE PDF
   ========================= */
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
    const txt = await r.text(); // souvent HTML (404/500)
    throw new Error(`Réponse non-JSON (${r.status}). Détail: ${txt.slice(0,200)}...`);
  }
}

export default function Home() {
  // ===== États principaux =====
  const [cvText, setCvText] = useState("");        // texte CV extrait (upload)
  const [offre, setOffre] = useState("");          // texte de l'offre
  const [outJSON, setOutJSON] = useState(null);    // résultat structuré pour le CV
  const [outLetter, setOutLetter] = useState(null);// profil + lettre générée
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [extracting, setExtracting] = useState(false);

  // ===== Choix du template =====
  const [cvTemplate, setCvTemplate] = useState("dark"); // "modern" | "gold" | "dark" | "clean"

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

  // ===== Photo : URL + FICHIER LOCAL (dataURL) =====
  const [photoUrl, setPhotoUrl] = useState("");         // URL (optionnel)
  const [photoDataUrl, setPhotoDataUrl] = useState(""); // IMPORT local (data:image/...)

  // ===== Utils upload + extract (CV fichier) =====
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

  // ===== Import photo locale → DataURL (affichée + intégrée au PDF) =====
  function onPhotoFile(e){
    const f = e.target.files?.[0]; if(!f) return;
    if(!/^image\/(png|jpe?g)$/i.test(f.type)) { setErr("Photo: format accepté JPG/PNG"); return; }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result); // data:image/...
    reader.onerror = () => setErr("Impossible de lire la photo.");
    reader.readAsDataURL(f);
  }

  // ===== Construit automatiquement un "texte CV de base" =====
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

  // ===== Génération CV (JSON) =====
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

  // ===== Génération Lettre (auto) =====
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
      setOutLetter({ profile: data.profile, letter: data.letter });
    }catch(e){ setErr(e.message || "Erreur"); }
    finally{ setLoading(false); }
  }

  // ===== Export PDF CV (avec choix du template) =====
  async function exportCVPro(){
    if(!outJSON) return;

    // photo prioritaire = import local (dataURL), sinon URL manuelle
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
      case "gold":
        Doc = <CVGoldHeader {...props} />;
        break;
      case "clean":
        Doc = <CVCleanPro {...props} />;
        break;
      case "modern":
        Doc = <CVProModern {...props} />;
        break;
      case "dark":
      default:
        Doc = <CVDarkSidebar {...props} />;
    }

    const blob = await pdf(Doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `CV_${cvTemplate}.pdf`; a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Export PDF Lettre =====
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

  // ===== Carte Template (vignette avec fallback) =====
  function TemplateCard({ id, title, img, selected, onClick }){
    const fallback = PREVIEW_SVGS[id] || PREVIEW_SVGS.modern;
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
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs">
          {title}
        </div>
        {selected && <div className="absolute inset-0 ring-2 ring-white/80 pointer-events-none rounded-xl" />}
      </button>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-bg1 to-bg2">
      <div className="max-w-[1100px] w-[92vw] mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shadow-soft bg-gradient-to-br from-accent to-indigo-600" />
            <div>
              <h1 className="text-2xl m-0">CV-IA</h1>
              <div className="text-xs border border-indigo-400/40 bg-indigo-400/20 px-2.5 py-1 rounded-full">
                Upload + Formulaire + IA + PDF multi-templates
              </div>
            </div>
          </div>
          <div className="hidden sm:flex gap-2 flex-wrap">
            <div className="bg-indigo-400/20 border border-indigo-400/40 text-indigo-100 px-3 py-1 rounded-lg text-sm">⚡ GPT</div>
            <div className="bg-indigo-400/20 border border-indigo-400/40 text-indigo-100 px-3 py-1 rounded-lg text-sm">📄 Templates PDF</div>
            <div className="bg-indigo-400/20 border border-indigo-400/40 text-indigo-100 px-3 py-1 rounded-lg text-sm">🧠 JSON structuré</div>
          </div>
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
              onChange={e=>setOffre(e.target.value)}
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
              <input className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                     value={cvName} onChange={e=>setCvName(e.target.value)} placeholder="Ex: Jean Dupont" />
            </div>
            <div>
              <label className="block text-white/70 mb-2 font-medium">Titre du poste</label>
              <input className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                     value={cvTitle} onChange={e=>setCvTitle(e.target.value)} placeholder="Ex: Développeur Web" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-white/70 mb-2 font-medium">Email</label>
              <input className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                     value={cvEmail} onChange={e=>setCvEmail(e.target.value)} placeholder="exemple@mail.com" />
            </div>
            <div>
              <label className="block text-white/70 mb-2 font-medium">Téléphone</label>
              <input className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                     value={cvPhone} onChange={e=>setCvPhone(e.target.value)} placeholder="+33 6 12 34 56 78" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-white/70 mb-2 font-medium">Localisation</label>
            <input className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                   value={cvLocation} onChange={e=>setCvLocation(e.target.value)} placeholder="Paris, France" />
          </div>

          {/* Photo : URL + Upload local avec aperçu */}
          <div className="mt-4 grid md:grid-cols-[1fr,auto] items-start gap-4">
            <div>
              <label className="block text-white/70 mb-2 font-medium">URL photo (optionnel)</label>
              <input
                className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                value={photoUrl}
                onChange={e=>setPhotoUrl(e.target.value)}
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
                  onError={(e)=>{ e.currentTarget.src=""; }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-white/70 mb-2 font-medium">Résumé (À propos)</label>
            <textarea className="w-full min-h-[120px] rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                      value={cvSummary} onChange={e=>setCvSummary(e.target.value)} placeholder="Décrivez-vous en quelques phrases..." />
          </div>

          <div className="mt-4">
            <label className="block text-white/70 mb-2 font-medium">Compétences (séparées par virgule)</label>
            <input className="w-full rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                   value={cvSkills} onChange={e=>setCvSkills(e.target.value)} placeholder="Ex: React, Node.js, SQL" />
          </div>

          <div className="mt-4">
            <label className="block text-white/70 mb-2 font-medium">Expériences (Poste - Entreprise - Années)</label>
            <textarea className="w-full min-h-[120px] rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                      value={cvExp} onChange={e=>setCvExp(e.target.value)} placeholder="Ex: Développeur - Google - 2020/2023" />
          </div>

          <div className="mt-4">
            <label className="block text-white/70 mb-2 font-medium">Formation (Diplôme - École - Année)</label>
            <textarea className="w-full min-h-[120px] rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
                      value={cvEdu} onChange={e=>setCvEdu(e.target.value)} placeholder="Ex: Master Info - Sorbonne - 2018" />
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

          {/* Sélecteur visuel de mise en page */}
          <div className="mt-4">
            <div className="text-sm text-white/70 mb-2">Mise en page :</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TemplateCard
                id="modern" title="Modern"
                img="/templates/modern.jpg"
                selected={cvTemplate==="modern"}
                onClick={()=>setCvTemplate("modern")}
              />
              <TemplateCard
                id="gold" title="Gold Header"
                img="/templates/gold.jpg"
                selected={cvTemplate==="gold"}
                onClick={()=>setCvTemplate("gold")}
              />
              <TemplateCard
                id="dark" title="Dark Sidebar"
                img="/templates/dark.jpg"
                selected={cvTemplate==="dark"}
                onClick={()=>setCvTemplate("dark")}
              />
              <TemplateCard
                id="clean" title="Clean Pro"
                img="/templates/clean.jpg"
                selected={cvTemplate==="clean"}
                onClick={()=>setCvTemplate("clean")}
              />
            </div>
            <div className="text-white/50 text-xs mt-2">
              Astuce : si les images /templates/*.jpg n’existent pas, un aperçu intégré s’affiche automatiquement.
            </div>
          </div>
        </div>

        {/* --------- SECTION LETTRE (auto) --------- */}
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
