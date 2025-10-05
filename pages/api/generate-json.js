export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { cvText = "", jobText = "" } = req.body || {};

    const data = {
      profile: {
        fullName: "Jean Dupont",
        title: "Développeur Full-Stack",
        email: "jean.dupont@mail.com",
        phone: "+33 6 12 34 56 78",
        location: "Paris, France",
        summary: "5 ans d’expérience, expert en React et Node.js.",
      },
      skills: ["JavaScript", "TypeScript", "React", "Node.js", "SQL"],
      experiences: [
        { role: "Dev Front-End", company: "TechCorp", start: "2021", end: "2024" },
        { role: "Dev Full-Stack", company: "StartApp", start: "2018", end: "2021" }
      ],
      education: [
        { degree: "Licence Informatique", school: "Université Paris", year: "2018" }
      ],
      letter:
        "Madame, Monsieur,\n\nJe souhaite mettre mes compétences en développement au service de votre entreprise. " +
        "Rigoureux, curieux et passionné, je suis convaincu que mon profil correspond à vos besoins.\n\nCordialement,\nJean Dupont"
    };

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur", details: e.message });
  }
}
