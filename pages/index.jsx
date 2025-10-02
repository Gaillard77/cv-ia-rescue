import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import CVProModern from "../components/pdf/CVProModern"; // adapte le chemin si besoin

export default function Home(){
  const [cv, setCv] = useState("");
  const [offre, setOffre] = useState("");
  const [outJSON, setOutJSON] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [extracting, setExtracting] = useState(false);

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
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ fileName: f.name, fileBase64: toBase64(buf) })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data?.error || "Extraction échouée");
      setCv(data.text);
    }catch(e){ setErr(e.message || "Erreur d'extraction"); }
    finally{ setExtracting(false); }
  }

  async function generatePro(){
    setLoading(true); setErr(null); setOutJSON(null);
    try{
      const r = await fetch("/api/generate-json", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ cvText: cv, jobText: offre })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data?.error || "Erreur serveur");
      setOutJSON(data);
    }catch(e){ setErr(e.message || "Erreur"); }
    finally{ setLoading(false); }
  }

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
    <div className="gradient-bg min-h-screen text-white">
      <div className="max-w-[1100px] w-[92vw] mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="logo w-10 h-10 rounded-xl shadow-soft bg-gradient-to-br from-accent to-indigo-600" />
            <div>
              <h1 className="text-2xl m-0">CV-IA</h1>
              <div className="badge">Upload + IA + PDF pro</div>
            </div>
          </div>
          <div className="hidden sm:flex gap-2 flex-wrap">
            <div className="kpi">⚡ GPT</div>
            <div className="kpi">📄 PDF moderne</div>
            <div className="kpi">🧠 JSON structuré</div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <label className="label">Votre CV — importez un fichier ou collez le texte</label>
            <input className="mb-2" type="file" accept=".pdf,.docx,.txt" onChange={onFile} />
            <div className="text-white/70 text-sm mb-2">{extracting ? "Extraction en cours…" : "Formats acceptés : PDF, DOCX, TXT"}</div>
            <textarea
              className="textarea"
              value={cv}
              onChange={e=>setCv(e.target.value)}
              placeholder="Le texte extrait du CV s’affiche ici (ou collez-le manuellement)."
            />
          </div>

          <div className="card">
            <label className="label">Offre d’emploi (texte)</label>
            <textarea
              className="textarea"
              value={offre}
              onChange={e=>setOffre(e.target.value)}
              placeholder="Collez ici la description du poste ciblé."
            />
            <div className="text-white/70 text-sm mt-2">Astuce : ciblez une seule offre pour un résultat très pertinent.</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap mt-4">
          <button className="btn btn-primary" onClick={generatePro} disabled={loading || !cv || !offre}>
            {loading ? "Génération en cours…" : "Générer (JSON structuré)"}
          </button>
          <button className="btn btn-success" onClick={exportCVPro} disabled={!outJSON}>
            Exporter CV PDF pro (moderne)
          </button>
          <button className="btn btn-ghost" onClick={()=>{ setCv(""); setOffre(""); setOutJSON(null); }}>
            Réinitialiser
          </button>
        </div>

        {/* Erreur */}
        {err && <div className="text-red-400 mt-3">❌ {err}</div>}

        {/* Aperçu structuré */}
        {outJSON && (
          <div className="card mt-4">
            <label className="label">Prévisualisation des données (pour contrôle)</label>
            <pre>{JSON.stringify(outJSON, null, 2)}</pre>
            <div className="text-white/70 text-sm mt-2">
              Vous pouvez enrichir <code>languages</code>, <code>hobbies</code> ou <code>profile.photoUrl</code> avant l’export.
            </div>
          </div>
        )}

        {/* Résumés en cartes (facultatif) */}
        {outJSON && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Résumé</h3>
              <pre>{outJSON?.profile?.summary || "—"}</pre>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Compétences</h3>
              <pre>{(outJSON?.skills||[]).join(", ")}</pre>
            </div>
            <div className="card md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">Expériences</h3>
              <pre>{JSON.stringify(outJSON?.experiences || [], null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
