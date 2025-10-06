// pages/api/generate-json.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY manquante (voir .env.local ou Vercel → Env Vars)" });
  }

  try {
    const { cvText = "", jobText = "" } = req.body || {};
    if (!cvText.trim() || !jobText.trim()) {
      return res.status(400).json({ error: "cvText et jobText sont requis" });
    }

    const schema = {
      type: "object",
      properties: {
        profile: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            title: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            location: { type: "string" },
            summary: { type: "string" },
            photoUrl: { type: "string" }
          },
          required: ["fullName", "title"]
        },
        skills: { type: "array", items: { type: "string" } },
        languages: { type: "array", items: { type: "string" } },
        hobbies: { type: "array", items: { type: "string" } },
        experiences: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string" },
              company: { type: "string" },
              start: { type: "string" },
              end: { type: "string" },
              bullets: { type: "array", items: { type: "string" } }
            },
            required: ["role", "company"]
          }
        },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              degree: { type: "string" },
              school: { type: "string" },
              year: { type: "string" }
            }
          }
        },
        letter: { type: "string" }
      },
      required: ["profile", "skills", "experiences", "education", "letter"]
    };

    // Prompt clair + contrainte "JSON uniquement"
    const prompt = `
Tu es un assistant carrière. À partir du CV brut et de l'offre ci-dessous, renvoie STRICTEMENT un JSON valide qui matche ce schéma:
${JSON.stringify(schema, null, 2)}

Règles:
- Réponds UNIQUEMENT en JSON (pas de texte hors JSON).
- Complète ou normalise proprement les champs manquants avec ce que tu déduis.
- "experiences[].bullets" = 2 à 5 puces d'impact (succès, chiffres, outils).
- "letter" = lettre de motivation courte, personnalisée pour l'offre, professionnelle et positive.

=== CV BRUT ===
${cvText}

=== OFFRE ===
${jobText}
`.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" }, // force un JSON
      messages: [
        { role: "system", content: "Tu es un assistant carrière. Toujours répondre en JSON strict." },
        { role: "user", content: prompt }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";

    // Parse sécurisé
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return res.status(502).json({
        error: "Réponse IA non-JSON",
        details: raw.slice(0, 400)
      });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
}

