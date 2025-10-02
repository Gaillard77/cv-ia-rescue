// components/pdf/CVProModern.jsx
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

/** Données attendues (outJSON):
{
  profile:{ fullName, title, summary, location, email, phone, photoUrl? },
  skills: [ "Skill 1", ... ],
  languages: [ "Français (C2)", ... ]    // optionnel
  hobbies: [ "Sport", ... ]              // optionnel
  experiences: [
    { company, role, start, end, bullets: [ "...", ... ] }
  ],
  education: [
    { school, degree, year }
  ]
}
*/

const styles = StyleSheet.create({
  page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 10 },
  // Sidebar (gauche)
  sidebar: { width: 190, backgroundColor: "#0e1a2b", color: "#fff" },
  sideInner: { padding: 16 },
  photoWrap: { width: 158, height: 158, borderRadius: 6, overflow: "hidden", marginBottom: 12, alignSelf: "center", backgroundColor: "#1b2a44" },
  photo: { width: 158, height: 158, objectFit: "cover" },
  name: { fontSize: 16, fontWeight: 700, marginTop: 6, lineHeight: 1.1 },
  title: { fontSize: 10, color: "#c6d3e6", marginBottom: 10 },
  line: { borderBottomWidth: 1, borderBottomColor: "#22324a", marginVertical: 10 },
  secTitleSide: { fontSize: 11, fontWeight: 700, marginBottom: 6, color: "#dfe7f3" },
  item: { marginBottom: 4, lineHeight: 1.3 },
  tag: { fontSize: 9, marginBottom: 3 },

  // Main (droite)
  main: { flex: 1, padding: 24, backgroundColor: "#ffffff", color: "#111" },
  header: { borderBottomWidth: 1, borderBottomColor: "#e6e8ee", paddingBottom: 8, marginBottom: 12 },
  secTitle: { fontSize: 12, fontWeight: 700, marginTop: 8, marginBottom: 6, color: "#0e1a2b" },
  paragraph: { lineHeight: 1.5, color: "#333" },
  expItem: { marginBottom: 10 },
  expRole: { fontSize: 11, fontWeight: 700, color: "#0e1a2b" },
  expMeta: { fontSize: 10, color: "#4d5e78", marginBottom: 4 },
  bullet: { fontSize: 10, lineHeight: 1.4, marginLeft: 8, marginBottom: 2 },
  eduItem: { marginBottom: 8 },
  small: { fontSize: 9, color: "#4d5e78" }
});

export default function CVProModern({
  profile = {}, skills = [], languages = [], hobbies = [], experiences = [], education = []
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Barre latérale */}
        <View style={styles.sidebar}>
          <View style={styles.sideInner}>
            <View style={styles.photoWrap}>
              {profile.photoUrl
                ? <Image style={styles.photo} src={profile.photoUrl} />
                : <View style={{flex:1, alignItems:"center", justifyContent:"center"}}>
                    <Text style={{color:"#aab6cc"}}>Photo</Text>
                  </View>}
            </View>

            <Text style={styles.name}>{profile.fullName || "Nom Prénom"}</Text>
            <Text style={styles.title}>{profile.title || "Intitulé de poste"}</Text>

            <View style={styles.line} />

            <Text style={styles.secTitleSide}>Coordonnées</Text>
            {profile.location ? <Text style={styles.item}>📍 {profile.location}</Text> : null}
            {profile.email ? <Text style={styles.item}>✉️ {profile.email}</Text> : null}
            {profile.phone ? <Text style={styles.item}>📞 {profile.phone}</Text> : null}

            {!!skills?.length && <>
              <View style={styles.line} />
              <Text style={styles.secTitleSide}>Compétences</Text>
              {skills.map((s, i) => <Text key={i} style={styles.tag}>• {s}</Text>)}
            </>}

            {!!languages?.length && <>
              <View style={styles.line} />
              <Text style={styles.secTitleSide}>Langues</Text>
              {languages.map((l, i) => <Text key={i} style={styles.item}>• {l}</Text>)}
            </>}

            {!!hobbies?.length && <>
              <View style={styles.line} />
              <Text style={styles.secTitleSide}>Centres d’intérêt</Text>
              {hobbies.map((h, i) => <Text key={i} style={styles.item}>• {h}</Text>)}
            </>}
          </View>
        </View>

        {/* Colonne principale */}
        <View style={styles.main}>
          <View style={styles.header}>
            <Text style={{fontSize: 16, fontWeight: 700, color:"#0e1a2b"}}>{profile.fullName || "Nom Prénom"}</Text>
            <Text style={{fontSize: 11, color:"#4d5e78"}}>{profile.title || ""}</Text>
          </View>

          {!!profile.summary && <>
            <Text style={styles.secTitle}>À propos de moi</Text>
            <Text style={styles.paragraph}>{profile.summary}</Text>
          </>}

          {!!experiences?.length && <>
            <Text style={styles.secTitle}>Expériences professionnelles</Text>
            {experiences.map((e, i) => (
              <View key={i} style={styles.expItem}>
                <Text style={styles.expRole}>{e.role || "Poste"} — {e.company || "Entreprise"}</Text>
                <Text style={styles.expMeta}>{e.start || ""} — {e.end || ""}</Text>
                {(e.bullets || []).slice(0, 6).map((b, j) => (
                  <Text key={j} style={styles.bullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </>}

          {!!education?.length && <>
            <Text style={styles.secTitle}>Formation</Text>
            {education.map((ed, i) => (
              <View key={i} style={styles.eduItem}>
                <Text style={{fontWeight:700}}>{ed.degree || "Diplôme"}</Text>
                <Text style={styles.small}>{ed.school || ""} • {ed.year || ""}</Text>
              </View>
            ))}
          </>}
        </View>
      </Page>
    </Document>
  );
}
