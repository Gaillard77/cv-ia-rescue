// components/pdf/letters/LetterConcept.jsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { padding: 0, fontFamily: "Helvetica", backgroundColor: "#1f2430", color: "#e9ecef" },
  header: { padding: 40, paddingBottom: 20 },
  name: { fontSize: 28, fontWeight: 700 },
  contact: { marginTop: 10, fontSize: 11, opacity: 0.9 },
  bodyWrap: { backgroundColor: "#fff", color: "#111", padding: 40, minHeight: 680, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  obj: { fontSize: 11, marginBottom: 16 },
  body: { fontSize: 11, lineHeight: 1.7, color: "#222" },
});

export default function LetterConcept({ profile = {}, letter = "" }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{profile.fullName || "Prénom NOM"}</Text>
          <Text style={s.contact}>
            {(profile.location || "") + (profile.phone ? `  •  ${profile.phone}` : "") + (profile.email ? `  •  ${profile.email}` : "")}
          </Text>
        </View>

        <View style={s.bodyWrap}>
          <Text style={{ fontSize: 11, textAlign: "right", marginBottom: 8 }}>
            {profile.city ? `Fait à ${profile.city}, ` : ""}{profile.date || ""}
          </Text>

          {profile.company && (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ textAlign: "right" }}>{profile.company}</Text>
              {profile.recruiter && <Text style={{ textAlign: "right" }}>{profile.recruiter}</Text>}
              {profile.companyAddress && <Text style={{ textAlign: "right" }}>{profile.companyAddress}</Text>}
            </View>
          )}

          {profile.object ? (
            <Text style={s.obj}><Text style={{ fontWeight: 700 }}>Objet : </Text>{profile.object}</Text>
          ) : null}

          <Text style={s.body}>{letter}</Text>

          <View style={{ marginTop: 22 }}>
            <Text>Cordialement,</Text>
            <Text style={{ fontWeight: 700, marginTop: 8 }}>{profile.fullName || ""}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
