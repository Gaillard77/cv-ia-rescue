import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page:{ padding:24, fontFamily:"Helvetica", fontSize:10, color:"#111" },
  header:{ flexDirection:"row", alignItems:"center", marginBottom:12, borderBottomWidth:2, borderBottomColor:"#c8a75a", paddingBottom:10 },
  photoWrap:{ width:64, height:64, borderRadius:32, overflow:"hidden", borderWidth:4, borderColor:"#c8a75a", marginRight:12 },
  name:{ fontSize:18, fontWeight:700, letterSpacing:1 },
  title:{ fontSize:11, color:"#555" },
  grid:{ flexDirection:"row", gap:16 },
  left:{ width:"32%" },
  right:{ width:"68%" },
  sec:{ fontSize:12, fontWeight:700, marginTop:10, marginBottom:6, color:"#2b2b2b" },
  small:{ fontSize:10, color:"#444" },
  bullet:{ marginLeft:8, marginBottom:2 },
  tag:{ fontSize:9, marginRight:6, marginBottom:3 }
});

export default function CVGoldHeader({ profile={}, skills=[], languages=[], hobbies=[], experiences=[], education=[] }){
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.photoWrap}>
            {profile.photoUrl ? <Image src={profile.photoUrl} style={{width:64, height:64}}/> : null}
          </View>
          <View>
            <Text style={s.name}>{profile.fullName || "Nom Prénom"}</Text>
            <Text style={s.title}>{profile.title || ""}</Text>
            <Text style={s.small}>{[profile.email, profile.phone, profile.location].filter(Boolean).join(" • ")}</Text>
          </View>
        </View>

        <View style={s.grid}>
          <View style={s.left}>
            {!!profile.summary && (<>
              <Text style={s.sec}>Objectifs</Text>
              <Text style={s.small}>{profile.summary}</Text>
            </>)}
            {!!skills.length && (<>
              <Text style={s.sec}>Compétences</Text>
              <View style={{flexDirection:"row", flexWrap:"wrap"}}>
                {skills.map((x,i)=><Text key={i} style={s.tag}>• {x}</Text>)}
              </View>
            </>)}
            {!!languages.length && (<>
              <Text style={s.sec}>Langues</Text>
              {languages.map((x,i)=><Text key={i} style={s.small}>• {x}</Text>)}
            </>)}
            {!!hobbies.length && (<>
              <Text style={s.sec}>Intérêts</Text>
              {hobbies.map((x,i)=><Text key={i} style={s.small}>• {x}</Text>)}
            </>)}
          </View>

          <View style={s.right}>
            {!!education.length && (<>
              <Text style={s.sec}>Formation</Text>
              {education.map((e,i)=>(
                <View key={i} style={{marginBottom:6}}>
                  <Text style={{fontWeight:700}}>{e.degree}</Text>
                  <Text style={s.small}>{e.school} • {e.year}</Text>
                </View>
              ))}
            </>)}

            {!!experiences.length && (<>
              <Text style={s.sec}>Expérience professionnelle</Text>
              {experiences.map((e,i)=>(
                <View key={i} style={{marginBottom:8}}>
                  <Text style={{fontWeight:700}}>{e.role} — {e.company}</Text>
                  <Text style={s.small}>{e.start} — {e.end}</Text>
                  {(e.bullets||[]).slice(0,6).map((b,j)=><Text key={j} style={s.bullet}>• {b}</Text>)}
                </View>
              ))}
            </>)}
          </View>
        </View>
      </Page>
    </Document>
  );
}
