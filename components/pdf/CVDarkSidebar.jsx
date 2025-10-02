import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
const s = StyleSheet.create({
  page:{ flexDirection:"row", fontFamily:"Helvetica", fontSize:10 },
  side:{ width:190, backgroundColor:"#1f2a37", color:"#fff", padding:16 },
  photo:{ width:120, height:120, borderRadius:60, overflow:"hidden", alignSelf:"center", marginBottom:12 },
  name:{ fontSize:18, fontWeight:700, marginBottom:2 }, title:{ fontSize:11, color:"#c7d2fe" },
  line:{ borderBottomWidth:1, borderBottomColor:"#334155", marginVertical:10 },
  tag:{ fontSize:9, marginBottom:3 },
  main:{ flex:1, backgroundColor:"#fff", color:"#111", padding:24 },
  h1:{ fontSize:18, fontWeight:700, marginBottom:4 },
  h2:{ fontSize:12, fontWeight:700, marginTop:10, marginBottom:6, color:"#111827" },
  small:{ color:"#374151", marginBottom:4 },
  bullet:{ marginLeft:8, marginBottom:2 }
});
export default function CVDarkSidebar({ profile={}, skills=[], languages=[], experiences=[], education=[] }){
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.side}>
          {profile.photoUrl ? <Image src={profile.photoUrl} style={s.photo}/> : null}
          <Text style={s.name}>{profile.fullName || "Nom Prénom"}</Text>
          <Text style={s.title}>{profile.title || ""}</Text>
          <View style={s.line}/>
          <Text>Contact</Text>
          {[profile.phone, profile.email, profile.location].filter(Boolean).map((x,i)=><Text key={i} style={s.small}>• {x}</Text>)}
          {!!education.length && (<>
            <View style={s.line}/><Text>Formation</Text>
            {education.map((e,i)=><Text key={i} style={s.small}>• {e.degree} — {e.school} ({e.year})</Text>)}
          </>)}
          {!!skills.length && (<>
            <View style={s.line}/><Text>Expertise</Text>
            {skills.map((x,i)=><Text key={i} style={s.tag}>• {x}</Text>)}
          </>)}
          {!!languages.length && (<>
            <View style={s.line}/><Text>Langues</Text>
            {languages.map((x,i)=><Text key={i} style={s.small}>• {x}</Text>)}
          </>)}
        </View>

        <View style={s.main}>
          <Text style={s.h1}>{profile.fullName || "Nom Prénom"}</Text>
          {!!profile.summary && <Text style={s.small}>{profile.summary}</Text>}
          {!!experiences.length && (<>
            <Text style={s.h2}>Expérience</Text>
            {experiences.map((e,i)=>(
              <View key={i} style={{marginBottom:8}}>
                <Text style={{fontWeight:700}}>{e.role} — {e.company}</Text>
                <Text style={s.small}>{e.start} — {e.end}</Text>
                {(e.bullets||[]).slice(0,6).map((b,j)=><Text key={j} style={s.bullet}>• {b}</Text>)}
              </View>
            ))}
          </>)}
          {!!education.length && (<>
            <Text style={s.h2}>Formation</Text>
            {education.map((ed,i)=>(
              <Text key={i} style={s.small}>• {ed.degree} — {ed.school} ({ed.year})</Text>
            ))}
          </>)}
        </View>
      </Page>
    </Document>
  );
}
