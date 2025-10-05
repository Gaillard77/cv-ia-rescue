export const config = {
  api: { bodyParser: { sizeLimit: "15mb" } }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { fileName } = req.body || {};

    const text =
      `Fichier : ${fileName}\n\n` +
      `Nom: Jean Dupont\nTitre: Développeur Full-Stack\nEmail: jean@mail.com\n` +
      `Téléphone: +33 6 12 34 56 78\nLieu: Paris, France\n\n` +
      `Compétences: React, Node.js, SQL, Docker\n\n` +
      `Expériences:\n- 2021–2024 TechCorp\n- 2018–2021 StartApp`;

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur", details: e.message });
  }
}
