import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Helvetica" },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 10 },
  body: { fontSize: 11, lineHeight: 1.5 },
  footer: { fontSize: 11, marginTop: 18 }
});

export default function LetterPro({ profile, letter }){
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Lettre de motivation</Text>
        <View style={{ marginBottom: 8 }}>
          <Text>{profile?.fullName || "Nom Prénom"}</Text>
          <Text>{profile?.email || ""} • {profile?.phone || ""}</Text>
          <Text>{profile?.location || ""}</Text>
        </View>
        <Text style={styles.body}>{letter || ""}</Text>
        <Text style={styles.footer}>Cordialement,{"\n"}{profile?.fullName || "Nom Prénom"}</Text>
      </Page>
    </Document>
  );
}
