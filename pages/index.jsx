// pages/index.jsx
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import CVProModern from "../components/pdf/CVProModern"; // adapte le chemin si besoin

export default function Home(){
  // États principaux
  const [cv, setCv] = useState("");           // texte du CV (collé ou extrait)
  const [offre, setOffre] = useState("");     // texte de l’offre
  const [outJSON, setOutJSON] = useState(null); // résultat structuré de /api/generate-json
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [extracting, setExtracting] = useState(false);

  // --- utilitaires upload ---
  function toBase64(buf){
    let binary=""; const bytes=new Uint8Array(buf);
    for(let i=0;i<bytes.byteLength;i++) binary+=String.fromCharCode(bytes[i]);
    return typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary,"binary").toString("base64");
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
      setCv(data.text); // ✅ remplit automatiquement le textarea CV
    }catch(e){
      setErr(e.message || "Erreur d'extraction");
    }finally{
      setExtracting(false);
    }
  }

  // --- génération PRO (JSON structuré) ---
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
      setOutJSON(data);  // ✅ garde profile, skills, experiences, education, letter, checklist, score
    }catch(e){
      setErr(e.message || "Erreur");
    }finally{
      setLoading(false);
    }
  }

  // --- export PDF pro (moderne) ---
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
    <main style={{fontFamily:"system-ui", padding:20, maxWidth:980, margin:"0 auto"}}>
      <h1 style={{margin:0}}>CV-IA — Générateur (Upload + JSON + PDF pro)</h1>
      <p style={{opacity:.8, marginTop:6}}>
        1) Importez votre <b>CV</b> (ou collez le texte) • 2) Collez l’<b>offre</b> • 3) <b>Générer (JSON structuré)</b> • 4) <b>Exporter PDF</b>
      </p>

      {/* Entrées */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, alignItems:"start"}}>
        <div>
          <label style={{display:"block", marginBottom:6, opacity:.85}}>CV (fichier ou texte)</label>
          <input type="file" accept=".pdf,.docx,.txt" onChange={onFile} style={{marginBottom:8}} />
          <small style={{display:"block", marginBottom:8, opacity:.7}}>
            {extracting ? "Extraction en cours..." : "Formats acceptés : PDF, DOCX, TXT"}
          </small>
          <textarea
            rows={12}
            value={cv}
            onChange={e=>setCv(e.target.value)}
            placeholder="Collez ici le texte de votre CV (ou utilisez l’import ci-dessus)"
            style={{width:"100%"}}
          />
        </div>

        <div>
          <label style={{display:"block", marginBottom:6, opacity:.85}}>Offre d’emploi (texte)</label>
          <textarea
            rows={12}
            value={offre}
            onChange={e=>setOffre(e.target.value)}
            placeholder="Collez ici la description de poste"
            style={{width:"100%"}}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{display:"flex", gap:10, flexWrap:"wrap", marginTop:12}}>
        <button
          onClick={generatePro}
          disabled={loading || !cv || !offre}
          style={{padding:"10px 14px", borderRadius:10, border:0, background:"#6c5ce7", color:"#fff", cursor:"pointer", opacity:(loading||!cv||!offre)?0.7:1}}
        >
          {loading ? "Génération..." : "Générer (JSON structuré)"}
        </button>

        <button
          onClick={exportCVPro}
          disabled={!outJSON}
          style={{padding:"10px 14px", borderRadius:10, border:"1px solid #ddd", background:"#fff", cursor:!outJSON?"not-allowed":"pointer"}}
        >
          Exporter CV PDF pro (moderne)
        </button>
      </div>

      {/* Erreur */}
      {err && <p style={{color:"crimson", marginTop:8}}>❌ {err}</p>}

      {/* Aperçu du JSON (utile pour vérifier les champs) */}
      {outJSON && (
        <section style={{marginTop:16}}>
          <h2 style={{marginBottom:6}}>Données structurées (aperçu)</h2>
          <pre style={{whiteSpace:"pre-wrap", background:"#f6f8fa", padding:12, borderRadius:8, border:"1px solid #eee"}}>
            {JSON.stringify(outJSON, null, 2)}
          </pre>
          <p style={{opacity:.75, marginTop:6}}>
            Astuce : vous pouvez enrichir <code>languages</code>, <code>hobbies</code> ou <code>profile.photoUrl</code> avant l’export.
          </p>
        </section>
      )}
    </main>
  );
}
