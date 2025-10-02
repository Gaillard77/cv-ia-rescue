// pages/index.jsx
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import CVProModern from "../components/pdf/CVProModern"; // adapte le chemin si besoin

export default function Home(){
  // ===== États principaux =====
  const [cv, setCv] = useState("");           // texte CV (importé/collé)
  const [offre, setOffre] = useState("");     // texte de l'offre
  const [outJSON, setOutJSON] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [extracting, setExtracting] = useState(false);

  // ===== Etats du formulaire minimal =====
  const [cvName, setCvName] = useState("");
  const [cvTitle, setCvTitle] = useState("");
  const [cvEmail, setCvEmail] = useState("");
  const [cvPhone, setCvPhone] = useState("");
  const [cvLocation, setCvLocation] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  const [cvSkills, setCvSkills] = useState("");
  const [cvExp, setCvExp] = useState("");
  const [cvEdu, setCvEdu] = useState("");

  // ===== Utils upload + extract =====
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
      setCv(data.text);
    }catch(e){ setErr(e.message || "Erreur d'extraction"); }
    finally{ setExtracting(false); }
  }

  // ===== Génération PRO (JSON) avec fallback formulaire minimal =====
  async function generatePro(){
    setLoading(true); setErr(null); setOutJSON(null);
    try{
      // si aucun texte CV importé/collé, construire un CV basique depuis le formulaire
      let baseText = cv;
      if(!baseText){
        baseText = `
Nom: ${cvName}
Titre: ${cvTitle}
Email: ${cvEmail}
Téléphone: ${cvPhone}
Lieu: ${cvLocation}
Résumé: ${cvSummary}

Compétences: ${cvSkills}

Expériences:
${cvExp}

Formation:
${cvEdu}
`.trim();
      }

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

  // ===== Export PDF moderne =====
  async function exportCVPro(){
    if(!outJSON) return;
    const blob = await pdf(
      <CVProModern
        profile={outJSON.profile}
        skills={outJSON.skills}
        languages={outJSON.languages || []}
        hobbies={outJSON.hobbies || []}
        experiences={outJSON.experiences}
        education={outJSON.education}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "CV_modern.pdf"; a.click();
    URL.revokeObjectURL(url);
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
                Upload + Formulaire + IA + PDF pro
              </div>
            </div>
          </div>
          <div className="hidden sm:flex gap-2 flex-wrap">
            <div className="bg-indigo-400/20 border border-indigo-400/40 text-indigo-100 px-3 py-1 rounded-lg text-sm">⚡ GPT</div>
            <div className="bg-indigo-400/20 border border-indigo-400/40 text-indigo-100 px-3 py-1 rounded-lg text-sm">📄 PDF moderne</div>
            <div className="bg-indigo-400/20 border border-indigo-400/40 text-indigo-100 px-3 py-1 rounded-lg text-sm">🧠 JSON structuré</div>
          </div>
        </div>

        {/* Zone import CV + Offre */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-white/10 rounded-2xl shadow-soft bg-gradient-to-b from-card1 to-card2 p-5">
            <label className="block text-white/70 mb-2 font-medium">Votre CV — importez un fichier ou collez le texte</label>
            <input className="mb-2" type="file" accept=".pdf,.docx,.txt" onChange={onFile} />
            <div className="text-white/70 text-sm mb-2">
              {extracting ? "Extraction en cours…" : "Formats acceptés : PDF, DOCX, TXT"}
            </div>
         
          </div>

          <div className="border border-white/10 rounded-2xl shadow-soft bg-gradient-to-b from-card1 to-card2 p-5">
            <label className="block text-white/70 mb-2 font-medium">Offre d’emploi (texte)</label>
            <textarea
              className="w-full min-h-[220px] rounded-xl border border-white/15 bg-[#0f1526] text-white p-3"
              value={offre}
              onChange={e=>setOffre(e.target.value)}
              placeholder="Collez ici la description du poste ciblé."
            />
            <div className="text-white/70 text-sm mt-2">Astuce : ciblez une seule offre pour un résultat très pertinent.</div>
          </div>
        </div>

        {/* Formulaire minimal (si pas de CV importé) */}
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
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap mt-4">
          <button className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-white bg-gradient-to-br from-accent to-indigo-600 hover:brightness-110 disabled:opacity-60"
                  onClick={generatePro} disabled={loading || (!cv && !cvName && !cvTitle)}>
            {loading ? "Génération en cours…" : "Générer (JSON structuré)"}
          </button>
          <button className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-white bg-gradient-to-br from-emerald-400 to-emerald-600 hover:brightness-110 disabled:opacity-60"
                  onClick={exportCVPro} disabled={!outJSON}>
            Exporter CV PDF pro (moderne)
          </button>
          <button className="inline-flex items-center justify-center rounded-xl px-4 py-3 border border-white/15 text-white/90 hover:bg-white/5"
                  onClick={()=>{ setCv(""); setOffre(""); setOutJSON(null);
                                 setCvName(""); setCvTitle(""); setCvEmail(""); setCvPhone("");
                                 setCvLocation(""); setCvSummary(""); setCvSkills(""); setCvExp(""); setCvEdu(""); }}>
            Réinitialiser
          </button>
        </div>

        {/* Erreur */}
        {err && <div className="text-red-400 mt-3">❌ {err}</div>}

        {/* Aperçu JSON */}
        {outJSON && (
          <div className="border border-white/10 rounded-2xl shadow-soft bg-gradient-to-b from-card1 to-card2 p-5 mt-4">
            <label className="block text-white/70 mb-2 font-medium">Prévisualisation des données (contrôle)</label>
            <pre className="whitespace-pre-wrap m-0 p-3 rounded-xl border border-white/10 bg-[#0e1426] text-[#e9ecf6]">
{JSON.stringify(outJSON, null, 2)}
            </pre>
            <div className="text-white/70 text-sm mt-2">
              Vous pouvez enrichir <code>languages</code>, <code>hobbies</code> ou <code>profile.photoUrl</code> avant l’export.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
