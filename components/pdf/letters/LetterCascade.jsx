// components/pdf/letters/LetterCascade.jsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { flexDirection: "row", fontFamily: "Helvetica" },
  sidebar: { width: 180, backgroundColor: "#1f8a78", color: "#fff", padding: 18 },
  name: { fontSize: 20, fontWeight: 700, lineHeight: 1.1 },
  role: { marginTop: 6, fontSize: 11 },
  blockTitle: { marginTop: 16, fontSize: 11, fontWeight: 700, opacity: 0.9 },
  small: { fontSize: 10, marginTop: 4, lineHeight: 1.4 },

  contentWrap: { flex: 1, padding: 32 },
  meta: { fontSize: 10, color: "#444", marginBottom: 10 },
  to: { fontSize: 11, marginBottom: 10, lineHeight: 1.4 },
  objLine: { fontSize: 11, marginVertical: 10 },
  h1: { fontSize: 12, fontWeight: 700, marginBottom: 10 },
  body: { fontSize: 11, lineHeight: 1.6, color: "#222" },
  sign: { fontSize: 11, marginTop: 18, fontWeight: 700 },
});

export default function LetterCascade({ profile = {}, letter = "" }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Colonne gauche (vert) */}
        <View style={s.sidebar}>
          <Text style={s.name}>{(profile.fullName || "").split(" ")[0] || ""}</Text>
          <Text style={s.name}>
            {(profile.fullName || "").split(" ").slice(1).join(" ")}
          </Text>
          {profile.title ? <Text style={s.role}>{profile.title}</Text> : null}

          <Text style={s.blockTitle}>Informations</Text>
          {profile.location ? <Text style={s.small}>{profile.location}</Text> : null}
          {profile.phone ? <Text style={s.small}>{profile.phone}</Text> : null}
          {profile.email ? <Text style={s.small}>{profile.email}</Text> : null}
          {profile.linkedin ? <Text style={s.small}>{profile.linkedin}</Text> : null}
        </View>

        {/* Corps de lettre */}
        <View style={s.contentWrap}>
          {profile.location || profile.date ? (
            <Text style={s.meta}>
              {profile.location ? `${profile.location}, ` : ""}{profile.date || ""}
            </Text>
          ) : null}

          {profile.company || profile.recruiter || profile.companyAddress ? (
            <View style={{ marginBottom: 8 }}>
              {profile.company ? <Text style={s.to}>{profile.company}</Text> : null}
              {profile.recruiter ? <Text style={s.to}>{profile.recruiter}</Text> : null}
              {profile.companyAddress ? <Text style={s.to}>{profile.companyAddress}</Text> : null}
            </View>
          ) : null}

          {profile.object ? (
            <Text style={s.objLine}>
              <Text style={{ fontWeight: 700 }}>Objet : </Text>{profile.object}
            </Text>
          ) : null}

          <Text style={s.body}>{letter}</Text>

          <View style={{ marginTop: 18 }}>
            <Text>Cordialement,</Text>
            <Text style={s.sign}>{profile.fullName || ""}</Text>
            {profile.phone ? <Text style={{ fontSize: 10 }}>{profile.phone}</Text> : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}
