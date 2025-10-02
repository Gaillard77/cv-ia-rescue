import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function toBase64(buf){
  let binary=""; const bytes=new Uint8Array(buf);
  for(let i=0;i<bytes.byteLength;i++) binary+=String.fromCharCode(bytes[i]);
  return typeof btoa!=="undefined" ? btoa(binary) : Buffer.from(binary,"binary").toString("base64");
}

export default function Home(){
  const [cv, setCv] = useState("");
  const [offre, setOffre] = useState("");
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [err, setErr] = useState(null);
  const resultRef = useRef(null);

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

  async function generate(){
    setLoading(true); setErr(null); setOut(null);
    try{
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ cvText: cv, jobText: offre })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data?.error || "Erreur serveur");
      setOut(data);
    }catch(e){ setErr(e.message || "Erreur"); }
    finally{ setLoading(false); }
  }

  async function exportPDF(){
    if(!resultRef.current) return;
    const canvas = await html2canvas(resultRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    // A4: 210 x 297 mm -> 595 x 842 pt
    const pdf = new jsPDF("p","pt","a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40; // marges
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let y = 20;
    if(imgHeight < pageHeight) {
      pdf.addImage(imgData, "PNG", 20, y, imgWidth, imgHeight);
    } else {
      // multi-pages
      let sY = 0;
      const pageCanvas = document.createElement("canvas");
      const pageCtx = pageCanvas.getContext("2d");
      const ratio = imgWidth / canvas.width;
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.floor(pageHeight / ratio);
      const pageHeightPx = pageCanvas.height;

      while(sY < canvas.height){
        pageCtx.clearRect(0,0,pageCanvas.width,pageCanvas.height);
        pageCtx.drawImage(canvas, 0, sY, canvas.width, pageHeightPx, 0, 0, canvas.width, pageHeightPx);
        const pageImg = pageCanvas.toDataURL("image/png");
        pdf.addImage(pageImg, "PNG", 20, 20, imgWidth, pageHeight - 40);
        sY += pageHeightPx;
        if(sY < canvas.height) pdf.addPage();
      }
    }
    pdf.save("candidature.pdf");
  }

  return (
    <main className="container">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h1>CV-IA — Générateur</h1>
        <span className="badge">Upload + Export PDF</span>
      </div>

      <div className="grid">
        <div className="card">
          <label>Votre CV — importez un fichier ou collez le texte</label>
          <input type="file" accept=".pdf,.docx,.txt" onChange={onFile} />
          <small style={{color:"var(--muted)"}}>
            {extracting ? "Extraction du texte..." : "Formats acceptés : PDF, DOCX, TXT"}
          </small>
          <textarea value={cv} onChange={e=>setCv(e.target.value)}
            placeholder="Le texte extrait du CV s’affiche ici (ou collez-le manuellement)." />
        </div>

        <div className="card">
          <label>Offre d’emploi (texte)</label>
          <textarea value={offre} onChange={e=>setOffre(e.target.value)}
            placeholder="Collez ici la description du poste..." />
        </div>
      </div>

      <div className="toolbar">
        <button className="btn" onClick={generate} disabled={loading || !cv || !offre}>
          {loading ? "Génération en cours..." : "Générer CV + Lettre + Checklist"}
        </button>
        <button className="btn" onClick={exportPDF} disabled={!out}>Exporter en PDF</button>
      </div>

      {err && <p style={{color:"#fca5a5",marginTop:8}}>❌ {err}</p>}

      {out && (
        <section className="grid" style={{marginTop:16}} ref={resultRef}>
          <div className="card">
            <h2>CV optimisé</h2>
            <pre>{out.cvOptimise}</pre>
          </div>
          <div className="card">
            <h2>Lettre de motivation</h2>
            <pre>{out.lettre}</pre>
          </div>
          <div className="card" style={{gridColumn:"1 / -1"}}>
            <h2>Checklist d’entretien & Score</h2>
            <pre>Score ATS estimé : {out.score}\n\n{out.checklist}</pre>
          </div>
        </section>
      )}
    </main>
  );
}
