// pages/index.jsx
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import CVProModern from "../components/pdf/CVProModern"; // <-- chemin OK si tu as components/pdf/CVProModern.jsx

export default function Home(){
  // États
  const [cv, setCv] = useState("");           // texte du CV (collé ou extrait)
  const [offre, setOffre] = useState("");     // texte de l’offre d’emploi
  const [outJSON, setOutJSON] = useState(null); // résultat structuré de /api/generate-json
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Appelle l'API /api/generate-json et stocke le résultat dans outJSON
  async function generatePro(){
    setLoading(true);
    setErr(null);
    setOutJSON(null);
    try{
      const r = await fetch("/api/generate-json", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ cvText: cv, jobText: offre })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data?.error || "Erreur serveur");
      setOutJSON(data); // ✅ garde le JSON (profile, skills, experiences, education, letter, checklist, score)
    }catch(e){
      setErr(e.message || "Erreur");
    }finally{
      setLoading(false);
    }
  }

  // Exporte un PDF "CV moderne" à partir de outJSON et du composant PDF
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
    a.href = url;
    a.download = "CV_modern.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={{fontFamily:"system-ui", padding:20, maxWidth:980, margin:"0 auto"}}>
      <h1 style={{margin:0}}>CV-IA — Générateur (PDF pro)</h1>
      <p style={{opacity:.8}}>
        1) Colle ton <b>CV</b> et l’<b>offre</b> • 2) Clique <b>Générer (JSON structuré)</b> • 3) <b>Exporter CV PDF pro</b>
      </p>

      {/* Entrées */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        <div>
          <label style={{display:"block", marginBottom:6, opacity:.8}}>CV (texte)</label>
          <textarea
            rows={12}
            value={cv}
            onChange={e=>setCv(e.target.value)}
            placeholder="Colle ici le texte de ton CV (ou utilise l'extraction que nous avons ajoutée ailleurs)"
            style={{width:"100%"}}
          />
        </div>
        <div>
          <label style={{display:"block", marginBottom:6, opacity:.8}}>Offre d’emploi (texte)</label>
          <textarea
            rows={12}
            value={offre}
            onChange={e=>setOffre(e.target.value)}
            placeholder="Colle ici la description du poste"
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

      {/* Aperçu JSON (utile pour débug / vérifier les champs) */}
      {outJSON && (
        <section style={{marginTop:16}}>
          <h2 style={{marginBottom:6}}>Données structurées (aperçu)</h2>
          <pre style={{whiteSpace:"pre-wrap", background:"#f6f8fa", padding:12, borderRadius:8, border:"1px solid #eee"}}>
            {JSON.stringify(outJSON, null, 2)}
          </pre>
          <p style={{opacity:.75, marginTop:6}}>
            Astuce : tu peux enrichir <code>outJSON</code> (ex. <code>languages</code>, <code>hobbies</code>, <code>profile.photoUrl</code>) avant l’export.
          </p>
        </section>
      )}
    </main>
  );
}
