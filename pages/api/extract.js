import * as mammoth from "mammoth";
import pdfParse from "pdf-parse";

export const config = { api: { bodyParser: { sizeLimit: "15mb" } } };

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try{
    const { fileName, fileBase64 } = req.body || {};
    if(!fileName || !fileBase64) return res.status(400).json({ error: "Missing file" });

    const ext = (fileName.split(".").pop() || "").toLowerCase();
    const buffer = Buffer.from(fileBase64, "base64");

    let text = "";
    if(ext === "pdf"){
      const data = await pdfParse(buffer);
      text = data.text || "";
    }else if(ext === "docx"){
      const out = await mammoth.extractRawText({ buffer });
      text = out.value || "";
    }else if(ext === "txt"){
      text = buffer.toString("utf8");
    }else{
      return res.status(415).json({ error: "Format non supporté (PDF, DOCX ou TXT)" });
    }

    text = text.replace(/\r/g,"").trim();
    if(!text) return res.status(422).json({ error: "Impossible d'extraire du texte" });

    res.status(200).json({ text });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}
