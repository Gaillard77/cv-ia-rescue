import OpenAI from "openai";

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { cvText, jobText } = req.body || {};
  if(!cvText || !jobText) return res.status(400).json({ error: "Champs manquants" });

  try{
    if(!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY manquante" });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Optimise ce CV pour cette offre.
OFFRE:
${jobText}
---
CV:
${cvText}

Retourne:
- un CV optimisé (format ATS)
- une lettre de motivation (200-300 mots)
- une checklist d'entretien (8-10 points)
- un score ATS (0-100)`;

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un expert RH concis et concret." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    });

    const text = resp.choices?.[0]?.message?.content || "";
    res.status(200).json({
      cvOptimise: text, lettre: text, checklist: text, score: 75
    });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
