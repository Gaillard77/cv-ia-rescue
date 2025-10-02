import { useState, useRef } from "react";
import { pdf } from "@react-pdf/renderer";        // pour générer les PDFs pro
import CVPro from "../components/pdf/CVPro";      // ton composant CV pro
import LetterPro from "../components/pdf/LetterPro"; // ton composant Lettre pro

export default function Home(){
  // ====== États (variables qui font réagir la page) ======
  const [cv, setCv] = useState("");         // texte du CV (collé ou extrait)
  const [offre, setOffre] = useState("");   // texte de l’offre
  const [out, setOut] = useState(null);     // résultat "texte" (ancienne API /api/generate)
  const [outJSON, setOutJSON] = useState(null); // ✅ résultat "structuré" (nouvelle API /api/generate-json)
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // ====== Génération classique (texte) — optionnel, tu peux garder si tu veux ======
  async function generateClassic(){
    setLoading(true); setErr(null); setOut(null);
    try{
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ cvText: cv, jobText: offre })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data?.error || "Erreur serveur");
      setOut(data);            // <- stocke le résultat texte
      setOutJSON(null);        // on efface l’autre pour éviter toute confusion d’affichage
    }catch(e){ setErr(e.message || "Erreur"); }
    finally{ setLoading(false); }
  }

  // ====== ✅ Génération PRO (JSON structuré) ======
  async function generatePro(){
    setLoading(true); setErr(null); setOutJSON(null);
    try{
      // On envoie CV + Offre à l'API structurée
      const r = await fetch("/api/generate-json", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ cvText: cv, jobText: offre })
      });
      const data = await r.json();          // <- on récupère l'objet JSON (profile, skills, experiences, education, letter, checklist, score)
      if(!r.ok) throw new Error(data?.error || "Erreur serveur");
      setOutJSON(data);                     // ✅ on stocke le JSON dans l’état
      setOut(null);                         // on efface l’ancien résultat texte
    }catch(e){ setErr(e.message || "Erreur"); }
    finally{ setLoading(false); }
  }

  // ====== Export PDF PRO (mise en page) – CV ======
  async function exportCVPro(){
    if(!outJSON) return;
    const blob = await pdf(
      <CVPro
        profile={outJSON.profile}
        skills={outJSON.skills}
        experiences={outJSON.experiences}
        education={outJSON.education}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "CV_pro.pdf"; a.click();
    URL.revokeObjectURL(url);
  }

  // ====== Export PDF PRO (mise en page) – Lettre ======
  async function exportLetterPro(){
    if(!outJSON) return;
    const blob = await pdf(
      <LetterPro
        profile={outJSON.profile}
        letter={outJSON.letter}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Lettre_pro.pdf"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={{fontFamily:"system-ui", padding:20, maxWidth:980, margin:"0 auto"}}>
      <h1>CV-IA — Générateur</h1>
      <p>Colle ton CV et l’offre, puis utilise la génération **classique** (texte) ou **PRO** (JSON structuré pour PDF).</p>

      {/* Entrées */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        <div>
          <label>CV (texte)</label>
          <textarea rows={12} value={cv} onChange={e=>setCv(e.target.value)} style={{width:"100%"}} />
        </div>
        <div>
          <label>Offre (texte)</label>
          <textarea rows={12} value={offre} onChange={e=>setOffre(e.target.value)} style={{width:"100%"}} />
        </div>
      </div>

      {/* Actions */}
      <div style={{display:"flex", gap:10, flexWrap:"wrap", marginTop:12}}>
        <button onClick={generateClassic} disabled={!cv || !offre || loading}>
          {loading ? "Génération..." : "Générer (classique texte)"}
        </button>

        <button onClick={generatePro} disabled={!cv || !offre || loading}>
          {loading ? "Génération..." : "Générer (JSON structuré)"}
        </button>

        {/* Exports PRO activés seulement si outJSON existe */}
        <button onClick={exportCVPro} disabled={!outJSON}>Exporter CV PDF pro</button>
        <button onClick={exportLetterPro} disabled={!outJSON}>Exporter Lettre PDF pro</button>
      </div>

      {/* Erreur */}
      {err && <p style={{color:"crimson", marginTop:8}}>❌ {err}</p>}

      {/* Affichage du résultat classique (texte brut) */}
      {out && (
        <section style={{marginTop:16}}>
          <h2>Résultat (classique / texte)</h2>
          <h3>CV optimisé</h3><pre>{out.cvOptimise}</pre>
          <h3>Lettre</h3><pre>{out.lettre}</pre>
          <h3>Checklist</h3><pre>{out.checklist}</pre>
          <h3>Score</h3><pre>{out.score}</pre>
        </section>
      )}

      {/* Affichage du JSON (pour vérifier la structure) */}
      {outJSON && (
        <section style={{marginTop:16}}>
          <h2>Résultat PRO (JSON structuré)</h2>
          <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(outJSON, null, 2)}</pre>
          <p style={{opacity:.7}}>Tu peux maintenant exporter en PDF pro (CV / Lettre) avec les boutons ci-dessus.</p>
        </section>
      )}
    </main>
  );
}
