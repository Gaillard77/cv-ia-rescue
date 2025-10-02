import { pdf } from "@react-pdf/renderer";
import CVPro from "../components/pdf/CVPro";
import LetterPro from "../components/pdf/LetterPro";


function toBase64(buf){
  let binary=""; const bytes=new Uint8Array(buf);
  for(let i=0;i<bytes.byteLength;i++) binary+=String.fromCharCode(bytes[i]);
  return typeof btoa!=="undefined" ? btoa(binary) : Buffer.from(binary,"binary").toString("base64");
}

// -------- OCR (PDF scannés) ----------
async function ocrPdfFile(file, pagesMax = 3){
  const pdfjs = await import("pdfjs-dist/build/pdf");
  const workerSrc = await import("pdfjs-dist/build/pdf.worker.mjs"); // nécessaire pour Vercel
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  const Tesseract = (await import("tesseract.js")).default;

  const buf = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buf });
  const pdf = await loadingTask.promise;

  let text = "";
  const pages = Math.min(pdf.numPages, pagesMax);
  for(let i=1;i<=pages;i++){
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 }); // rendu HD
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width; canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;

    const { data: { text: pageText } } = await Tesseract.recognize(
      canvas, "eng+fra", { logger: () => {} }
    );
    text += (pageText || "") + "\n";
  }
  return text.replace(/\r/g,"").trim();
}

// -------- PDF “propre” (mise en page) ----------
const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, fontFamily: "Helvetica" },
  h1: { fontSize: 18, marginBottom: 6, fontWeight: 700 },
  h2: { fontSize: 14, marginTop: 10, marginBottom: 6, fontWeight: 700 },
  mono: { fontSize: 11, lineHeight: 1.3 }
});
function DocPDF({ cv, lettre, checklist, score }){
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Candidature générée</Text>
        <Text>Score ATS estimé : {String(score)}</Text>
        <Text style={styles.h2}>CV optimisé</Text>
        <Text style={styles.mono}>{cv}</Text>
        <Text style={styles.h2}>Lettre de motivation</Text>
        <Text style={styles.mono}>{lettre}</Text>
        <Text style={styles.h2}>Checklist entretien</Text>
        <Text style={styles.mono}>{checklist}</Text>
      </Page>
    </Document>
  );
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
      // 1) essai extraction serveur (pdf-parse / mammoth / txt)
      const r = await fetch("/api/extract", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ fileName: f.name, fileBase64: toBase64(await f.arrayBuffer()) })
      });
      let data = await r.json();
      let text = r.ok ? (data.text || "") : "";

      // 2) fallback OCR si extraction vide
      if(!text){
        const ocrText = await ocrPdfFile(f);
        if(ocrText) text = ocrText;
      }

      if(!text) throw new Error("Impossible d'extraire du texte (essayez un PDF/DOCX non scanné).");
      setCv(text);
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

  // export “capture” (rapide)
  async function exportCapture(){
    if(!resultRef.current) return;
    const canvas = await html2canvas(resultRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p","pt","a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW - 40, imgH = canvas.height * imgW / canvas.width;
    if(imgH <= pageH - 40) {
      pdf.addImage(imgData, "PNG", 20, 20, imgW, imgH);
    } else {
      // multi-pages
      let y = 0;
      const ratio = imgW / canvas.width;
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.floor((pageH - 40) / ratio);
      const ctx = pageCanvas.getContext("2d");
      while(y < canvas.height){
        ctx.clearRect(0,0,pageCanvas.width,pageCanvas.height);
        ctx.drawImage(canvas, 0, y, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
        pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 20, 20, imgW, pageH - 40);
        y += pageCanvas.height;
        if(y < canvas.height) pdf.addPage();
      }
    }
    pdf.save("candidature_capture.pdf");
  }

  // export “propre” (mise en page)
  async function exportPropre(){
    if(!out) return;
    const blob = await pdf(<DocPDF
      cv={out.cvOptimise} lettre={out.lettre}
      checklist={out.checklist} score={out.score}
    />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "candidature.pdf"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="container">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h1>CV-IA — Générateur</h1>
        <span className="badge">Upload + OCR + Export PDF</span>
      </div>

      <div className="grid">
        <div className="card">
          <label>Votre CV — importez un fichier ou collez le texte</label>
          <input type="file" accept=".pdf,.docx,.txt" onChange={onFile} />
          <small style={{color:"var(--muted)"}}>
            {extracting ? "Extraction/OCR en cours..." : "PDF, DOCX, TXT — OCR auto si scanné"}
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
        <button className="btn" onClick={exportPropre} disabled={!out}>Exporter PDF propre</button>
        <button className="btn" onClick={exportCapture} disabled={!out}>Exporter PDF capture</button>
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
            <pre>Score ATS estimé : {out.score}{"\n\n"}{out.checklist}</pre>
          </div>
        </section>
      )}
    </main>
  );
}
