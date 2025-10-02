import OpenAI from "openai";

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { cvText, jobText } = req.body || {};
  if(!cvText || !jobText) return res.status(400).json({ error: "Champs manquants" });

  try{
    if(!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY manquante" });
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `Tu es un expert RH. Retourne STRICTEMENT un JSON valide suivant ce schéma:
{
  "profile": { "fullName": "string", "title": "string", "summary": "string", "location": "string", "email": "string", "phone": "string" },
  "skills": ["string"],
  "experiences": [
    {"company":"string","role":"string","start":"YYYY","end":"YYYY ou 'Présent'","bullets":["phrase d'impact mesurée"] }
  ],
  "education": [
    {"school":"string","degree":"string","year":"YYYY"}
  ],
  "letter": "string (200-300 mots)",
  "checklist": ["string"],
  "score": 0
}
Retourne UNIQUEMENT le JSON, sans texte autour. Utilise des nombres/chaînes simples. Langue: français.`;
    const user = `Optimise ce CV pour cette offre.
OFFRE:
${jobText}

---
CV:
${cvText}
`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.3
    });

    let raw = resp.choices?.[0]?.message?.content?.trim() || "{}";
    // nettoie si le modèle a ajouté du texte parasite
    const first = raw.indexOf("{"); const last = raw.lastIndexOf("}");
    if(first !== -1 && last !== -1) raw = raw.slice(first, last+1);
    const data = JSON.parse(raw);

    return res.status(200).json(data);
  }catch(e){
    console.error(e);
    return res.status(500).json({ error: "Erreur serveur / parsing JSON" });
  }
}
