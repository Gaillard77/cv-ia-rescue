import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
const s = StyleSheet.create({
  page:{ padding:28, fontFamily:"Helvetica", fontSize:10, color:"#111" },
  header:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10, borderBottomWidth:1, borderBottomColor:"#e5e7eb", paddingBottom:8 },
  left:{}, right:{ alignItems:"flex-end" },
  name:{ fontSize:16, fontWeight:700 }, title:{ fontSize:11, color:"#374151" },
  sec:{ fontSize:12, fontWeight:700, marginTop:10, marginBottom:6 },
  line:{ borderBottomWidth:1, borderBottomColor:"#e5e7eb", marginVertical:6 },
  bullet:{ marginLeft:8, marginBottom:2 }, small:{ color:"#374151" },
  grid:{ flexDirection:"row", gap:16 }, col:{ width:"50%" }
});
export default function CVCleanPro({ profile={}, skills=[], languages=[], experiences=[], education=[] }){
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.left}>
            <Text style={s.name}>{profile.fullName || "Nom Prénom"}</Text>
            <Text style={s.title}>{profile.title || ""}</Text>
          </View>
          <View style={s.right}>
            {[profile.email, profile.phone, profile.location].filter(Boolean).map((x,i)=><Text key={i} style={s.small}>{x}</Text>)}
          </View>
        </View>

        {!!profile.summary && (<>
          <Text style={s.sec}>Profil professionnel</Text>
          <Text style={s.small}>{profile.summary}</Text>
          <View style={s.line}/>
        </>)}

        <View style={s.grid}>
          <View style={s.col}>
            {!!experiences.length && (<>
              <Text style={s.sec}>Expérience</Text>
              {experiences.map((e,i)=>(
                <View key={i} style={{marginBottom:8}}>
                  <Text style={{fontWeight:700}}>{e.role} — {e.company}</Text>
                  <Text style={s.small}>{e.start} — {e.end}</Text>
                  {(e.bullets||[]).slice(0,5).map((b,j)=><Text key={j} style={s.bullet}>• {b}</Text>)}
                </View>
              ))}
            </>)}
          </View>
          <View style={s.col}>
            {!!education.length && (<>
              <Text style={s.sec}>Formation</Text>
              {education.map((ed,i)=>(
                <View key={i} style={{marginBottom:6}}>
                  <Text style={{fontWeight:700}}>{ed.degree}</Text>
                  <Text style={s.small}>{ed.school} • {ed.year}</Text>
                </View>
              ))}
            </>)}
            {!!skills.length && (<>
              <Text style={s.sec}>Compétences</Text>
              <Text style={s.small}>{skills.join(" • ")}</Text>
            </>)}
            {!!languages.length && (<>
              <Text style={s.sec}>Langues</Text>
              <Text style={s.small}>{languages.join(" • ")}</Text>
            </>)}
          </View>
        </View>
      </Page>
    </Document>
  );
}
