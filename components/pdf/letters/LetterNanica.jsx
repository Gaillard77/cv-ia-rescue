// components/pdf/letters/LetterNanica.jsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica" },
  sender: { fontSize: 20, fontWeight: 700 },
  small: { fontSize: 11, marginTop: 6 },
  rightMeta: { fontSize: 11, marginTop: 24, textAlign: "right" },
  body: { marginTop: 40, fontSize: 11, lineHeight: 1.6, color: "#222" },
});

export default function LetterNanica({ profile = {}, letter = "" }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.sender}>{profile.fullName || "Prénom NOM"}</Text>
        {profile.location ? <Text style={s.small}>Adresse {profile.location}</Text> : null}
        {profile.phone ? <Text style={s.small}>Téléphone {profile.phone}</Text> : null}
        {profile.email ? <Text style={s.small}>e-mail {profile.email}</Text> : null}

        <Text style={s.rightMeta}>
          {profile.city ? `Fait à ${profile.city}, ` : ""}{profile.date || "(Date)"}
        </Text>

        <View style={{ marginTop: 26 }}>
          {profile.company && <Text style={{ textAlign: "right" }}>{profile.company}</Text>}
          {profile.recruiter && <Text style={{ textAlign: "right" }}>{profile.recruiter}</Text>}
          {profile.companyAddress && <Text style={{ textAlign: "right" }}>{profile.companyAddress}</Text>}
        </View>

        {profile.object ? (
          <Text style={{ marginTop: 26, fontSize: 11 }}>
            <Text style={{ fontWeight: 700 }}>Objet : </Text>{profile.object}
          </Text>
        ) : null}

        <View style={s.body}>
          <Text>{letter}</Text>
          <View style={{ marginTop: 20 }}>
            <Text>Je vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.</Text>
            <Text style={{ marginTop: 12, fontWeight: 700 }}>{profile.fullName || ""}</Text>
            {profile.phone ? <Text style={{ fontSize: 10 }}>{profile.phone}</Text> : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}
