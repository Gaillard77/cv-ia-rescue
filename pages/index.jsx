import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import CVProModern from "../components/pdf/CVProModern"; // assure le chemin

export default function Home(){
  // États
  const [cv, setCv] = useState("");
  const [offre, setOffre] = useState("");
  const [outJSON, setOutJSON] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [extracting, setExtracting] = useState(false);

  // Utils upload + extract
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

  // Génération JSON
  async function generatePro(){
    setLoading(true); setErr(null); setOutJSON(null);
    try{
      const r = await fetch("/api/generate-json", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ cvText: cv, jobText: offre })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data?.error || "Erreur serveur");
      setOutJSON(data);
    }catch(e){ setErr(e.message || "Erreur"); }
    finally{ setLoading(false); }
  }

  // Export PDF moderne
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
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1 className="title">CV-IA</h1>
            <div className="badge">Générateur — Upload + PDF Pro</div>
          </div>
        </div>
        <div className="kpis">
          <div className="kpi">⚡ IA GPT</div>
          <div className="kpi">📄 PDF moderne</div>
          <div className="kpi">🧠 Structuré</div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid">
        <div className="card">
          <label>Votre CV — importez un fichier ou collez le texte</label>
          <input type="file" accept=".pdf,.docx,.txt" onChange={onFile} />
          <div className="note">{extracting ? "Extraction en cours…" : "Formats acceptés : PDF, DOCX, TXT"}</div>
          <textarea
            value={cv}
            onChange={e=>setCv(e.target.value)}
            placeholder="Le texte extrait du CV s’affiche ici (ou collez-le manuellement)."
          />
        </div>

        <div className="card">
          <label>Offre d’emploi (texte)</label>
          <textarea
            value={offre}
            onChange={e=>setOffre(e.target.value)}
            placeholder="Collez ici la description du poste ciblé."
          />
          <div className="note">Astuce : ciblez une seule offre pour un résultat très pertinent.</div>
        </div>
      </div>

      {/* Actions */}
      <div className="toolbar">
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

      {err && <div className="error">❌ {err}</div>}

      {/* Aperçu structuré */}
      {outJSON && (
        <div className="card" style={{marginTop:16}}>
          <label>Prévisualisation des données (pour contrôle)</label>
          <pre>{JSON.stringify(outJSON, null, 2)}</pre>
          <div className="note">Vous pouvez enrichir languages / hobbies / profile.photoUrl puis ré-exporter.</div>
        </div>
      )}

      {/* Résultats mis en cartes (si tu veux voir le texte brut) */}
      {outJSON && (
        <div className="results">
          <div className="card">
            <h3 style={{marginTop:0}}>Résumé</h3>
            <pre>{outJSON?.profile?.summary || "—"}</pre>
          </div>
          <div className="card">
            <h3 style={{marginTop:0}}>Compétences</h3>
            <pre>{(outJSON?.skills||[]).join(", ")}</pre>
          </div>
          <div className="card full">
            <h3 style={{marginTop:0}}>Expériences</h3>
            <pre>{JSON.stringify(outJSON?.experiences || [], null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
