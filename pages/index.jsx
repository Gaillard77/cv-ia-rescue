import { useState } from "react";

export default function Home(){
  const [cv, setCv] = useState("");
  const [offre, setOffre] = useState("");
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function generate(){
    setLoading(true); setErr(null);
    try{
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ cvText: cv, jobText: offre })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data.error || "Erreur serveur");
      setOut(data);
    }catch(e){ setErr(e.message) } finally { setLoading(false); }
  }

  return (
    <main style={{fontFamily:"system-ui", padding:20, maxWidth:900, margin:"0 auto"}}>
      <h1>CV-IA — Générateur</h1>
      <p>Colle ton CV + l’offre, puis clique Générer.</p>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        <div><label>CV (texte)</label><textarea rows={12} value={cv} onChange={e=>setCv(e.target.value)} style={{width:"100%"}} /></div>
        <div><label>Offre (texte)</label><textarea rows={12} value={offre} onChange={e=>setOffre(e.target.value)} style={{width:"100%"}} /></div>
      </div>
      <button onClick={generate} disabled={!cv || !offre || loading} style={{marginTop:12}}>
        {loading ? "Génération..." : "Générer CV + Lettre + Checklist"}
      </button>
      {err && <p style={{color:"crimson"}}>❌ {err}</p>}
      {out && (
        <section style={{marginTop:16}}>
          <h2>CV optimisé</h2><pre>{out.cvOptimise}</pre>
          <h2>Lettre</h2><pre>{out.lettre}</pre>
          <h2>Checklist</h2><pre>{out.checklist}</pre>
          <h2>Score ATS</h2><pre>{out.score}</pre>
        </section>
      )}
    </main>
  );
}
