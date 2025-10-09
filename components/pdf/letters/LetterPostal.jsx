// components/pdf/letters/LetterPostal.jsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 40 },
  sender: { letterSpacing: 2, fontSize: 14 },
  receiver: { letterSpacing: 2, fontSize: 14, textAlign: "right" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 26 },
  label: { letterSpacing: 4, fontSize: 10 },
  body: { marginTop: 36, fontSize: 11, lineHeight: 1.7, color: "#222" },
  sign: { marginTop: 28, fontSize: 11, fontWeight: 700 },
});

export default function LetterPostal({ profile = {}, letter = "" }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.sender}>{(profile.fullName || "").toUpperCase()}</Text>
            {profile.contact && <Text>{profile.contact}</Text>}
            {profile.location && <Text>{profile.location}</Text>}
          </View>
          <View>
            <Text style={s.receiver}>{(profile.company || "NOM ENTREPRISE").toUpperCase()}</Text>
            {profile.companyAddress && <Text style={{ textAlign: "right" }}>{profile.companyAddress}</Text>}
          </View>
        </View>

        <View style={s.row}>
          <Text style={s.label}>OBJET :</Text>
          <Text style={s.label}>{profile.date || "DATE, LIEU"}</Text>
        </View>

        <View style={s.body}>
          <Text>{letter}</Text>
          <View style={{ marginTop: 24 }}>
            <Text>Bien à vous,</Text>
            <Text style={s.sign}>{profile.fullName || ""}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
