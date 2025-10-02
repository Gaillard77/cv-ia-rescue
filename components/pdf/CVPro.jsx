import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Helvetica" },
  header: { borderBottom: 1, borderColor: "#222", paddingBottom: 6, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: 700 },
  title: { fontSize: 11, color: "#444" },
  grid: { flexDirection: "row", gap: 12 },
  colLeft: { width: "65%" },
  colRight: { width: "35%" },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 10, marginBottom: 6 },
  item: { marginBottom: 8 },
  role: { fontSize: 11, fontWeight: 700 },
  meta: { fontSize: 10, color: "#555", marginBottom: 4 },
  bullet: { fontSize: 10, marginLeft: 8, marginBottom: 2 },
  small: { fontSize: 10 },
  tag: { fontSize: 9, marginRight: 6 }
});

export default function CVPro({ profile, skills = [], experiences = [], education = [] }){
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile?.fullName || "Nom Prénom"}</Text>
          <Text style={styles.title}>
            {(profile?.title || "Titre")} • {(profile?.location || "")} • {(profile?.email || "")} • {(profile?.phone || "")}
          </Text>
          {profile?.summary ? <Text style={{ fontSize: 10, marginTop: 6 }}>{profile.summary}</Text> : null}
        </View>

        <View style={styles.grid}>
          {/* Colonne gauche */}
          <View style={styles.colLeft}>
            <Text style={styles.sectionTitle}>Expériences</Text>
            {experiences.map((e, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.role}>{e.role || "Poste"} — {e.company || "Entreprise"}</Text>
                <Text style={styles.meta}>{e.start || ""} — {e.end || ""}</Text>
                {(e.bullets || []).slice(0,5).map((b, j) => (
                  <Text key={j} style={styles.bullet}>• {b}</Text>
                ))}
              </View>
            ))}

            <Text style={styles.sectionTitle}>Formation</Text>
            {education.map((ed, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.role}>{ed.degree || "Diplôme"}</Text>
                <Text style={styles.meta}>{ed.school || ""} • {ed.year || ""}</Text>
              </View>
            ))}
          </View>

          {/* Colonne droite */}
          <View style={styles.colRight}>
            <Text style={styles.sectionTitle}>Compétences</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {skills.map((s, i) => <Text key={i} style={styles.tag}>• {s}</Text>)}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
