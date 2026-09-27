import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { openLink } from '../../utils/openLink';

/** Minúsculas sin tildes: "jalon" encuentra "JALÓN" */
const norm = (s:string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const capitalizar = (s:string) => s.charAt(0)+s.slice(1).toLowerCase();

const GRUPOS=['TODOS','PECTORAL','DORSALES','DELTOIDES LATERAL','DELTOIDES ANTERIOR','BÍCEPS','TRÍCEPS','CUÁDRICEPS','ISQUIOTIBIALES','GLÚTEOS','GEMELOS','ABDOMINALES','TRAPECIOS'];
const EJS=[
  {n:'PRESS BANCA',m:'PECTORAL',v:'https://youtube.com/shorts/mQruhM7i2uw'},
  {n:'PRESS INCLINADO 30°',m:'PECTORAL',v:'https://youtube.com/shorts/HZuuMaoCv4A'},
  {n:'PRESS PLANO CON MANCUERNAS',m:'PECTORAL',v:''},
  {n:'APERTURAS EN POLEA',m:'PECTORAL',v:''},
  {n:'DOMINADAS PRONAS',m:'DORSALES',v:'https://youtube.com/shorts/VVA9M3sC45Y'},
  {n:'JALÓN AL PECHO',m:'DORSALES',v:'https://youtube.com/shorts/G7298b2EBQw'},
  {n:'REMO CON BARRA',m:'DORSALES',v:'https://youtube.com/shorts/kBWAon7ItDw'},
  {n:'REMO EN POLEA SENTADO',m:'DORSALES',v:''},
  {n:'ELEVACIONES LATERALES',m:'DELTOIDES LATERAL',v:'https://youtube.com/shorts/R5DGM-ewOZE'},
  {n:'ELEVACIONES LATERALES EN POLEA',m:'DELTOIDES LATERAL',v:''},
  {n:'PRESS MILITAR CON BARRA',m:'DELTOIDES ANTERIOR',v:''},
  {n:'ELEVACIONES FRONTALES',m:'DELTOIDES ANTERIOR',v:''},
  {n:'CURL CON BARRA',m:'BÍCEPS',v:'https://youtube.com/shorts/ZHRML2E9bgo'},
  {n:'CURL MARTILLO',m:'BÍCEPS',v:''},
  {n:'CURL PREDICADOR',m:'BÍCEPS',v:''},
  {n:'TRICEPS EN POLEA CON CUERDA',m:'TRÍCEPS',v:'https://youtube.com/shorts/UarWtAPHn4o'},
  {n:'PRESS FRANCÉS',m:'TRÍCEPS',v:''},
  {n:'FONDOS EN PARALELAS',m:'TRÍCEPS',v:''},
  {n:'SENTADILLA CON BARRA',m:'CUÁDRICEPS',v:''},
  {n:'PRENSA 45°',m:'CUÁDRICEPS',v:'https://youtube.com/shorts/WpYz3qOJPD0'},
  {n:'EXTENSIONES DE CUÁDRICEPS',m:'CUÁDRICEPS',v:''},
  {n:'SENTADILLA BÚLGARA',m:'CUÁDRICEPS',v:''},
  {n:'CURL FEMORAL TUMBADO',m:'ISQUIOTIBIALES',v:'https://youtube.com/shorts/AnbFnGF88Ug'},
  {n:'PESO MUERTO RUMANO',m:'ISQUIOTIBIALES',v:'https://youtube.com/shorts/JCXZPCotTHY'},
  {n:'CURL FEMORAL SENTADO',m:'ISQUIOTIBIALES',v:''},
  {n:'HIP THRUST CON BARRA',m:'GLÚTEOS',v:'https://youtube.com/shorts/0raPTUNHOq8'},
  {n:'GLUTE BRIDGE',m:'GLÚTEOS',v:''},
  {n:'PATADAS DE GLÚTEO EN POLEA',m:'GLÚTEOS',v:''},
  {n:'ELEVACIÓN DE TALONES DE PIE',m:'GEMELOS',v:''},
  {n:'GEMELOS EN PRENSA',m:'GEMELOS',v:''},
  {n:'ABDOMEN EN POLEA',m:'ABDOMINALES',v:'https://youtube.com/shorts/uNUTTOmtrPY'},
  {n:'ELEVACIÓN DE PIERNAS COLGADO',m:'ABDOMINALES',v:''},
  {n:'PLANCHA',m:'ABDOMINALES',v:''},
  {n:'ENCOGIMIENTOS CON BARRA',m:'TRAPECIOS',v:''},
  {n:'FARMER WALK',m:'TRAPECIOS',v:''},
];

export default function EjerciciosScreen() {
  const [busq,setBusq]=useState('');
  const [grupo,setGrupo]=useState('TODOS');

  const filtered=useMemo(()=>{
    const q=norm(busq.trim());
    return EJS.filter(e=>norm(e.n).includes(q)&&(grupo==='TODOS'||e.m===grupo));
  },[busq,grupo]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}>
        <Text style={s.tit}>Ejercicios</Text>
        <Text style={s.count}>{filtered.length}</Text>
      </View>
      <View style={s.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textLight}/>
        <TextInput style={s.searchInp} placeholder="Buscar ejercicio..." value={busq} autoCorrect={false} clearButtonMode="while-editing" onChangeText={setBusq} placeholderTextColor={Colors.textLight}/>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.gruposRow} contentContainerStyle={{paddingHorizontal:Spacing.md}}>
        {GRUPOS.map(g=>(
          <TouchableOpacity key={g} style={[s.gChip,grupo===g&&s.gChipOn]} onPress={()=>setGrupo(g)}>
            <Text style={[s.gChipTxt,grupo===g&&s.gChipTxtOn]}>{g==='TODOS'?'Todos':capitalizar(g)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        style={s.scroll}
        contentContainerStyle={{paddingBottom:Spacing.xl}}
        data={filtered}
        keyExtractor={e=>e.n}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={<Text style={s.empty}>No hay ejercicios que coincidan</Text>}
        renderItem={({item:e})=>(
          <View style={s.ejCard}>
            <View style={s.ejThumb}><Text style={s.ejThumbTxt}>{e.v?'▶':'CF'}</Text></View>
            <View style={{flex:1}}>
              <Text style={s.ejNom}>{capitalizar(e.n)}</Text>
              <Text style={s.ejMus}>{capitalizar(e.m)}</Text>
            </View>
            {/* Ternario mejor que "x && ...": si x fuese 0 u otro texto, React Native lo pintaría fuera de <Text> y se caería */}
            {e.v?<TouchableOpacity onPress={()=>openLink(e.v)} hitSlop={8}><Ionicons name="play-circle-outline" size={26} color={Colors.primary}/></TouchableOpacity>:null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.background},
  scroll:{flex:1,padding:Spacing.md},
  hdr:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:Spacing.md},
  tit:{fontSize:FontSize.xxl,fontWeight:'700',color:Colors.text},
  count:{fontSize:FontSize.sm,color:Colors.textSecondary},
  searchBox:{flexDirection:'row',alignItems:'center',gap:Spacing.sm,backgroundColor:Colors.card,margin:Spacing.md,marginTop:0,borderRadius:Radius.md,padding:Spacing.md,borderWidth:1,borderColor:Colors.border},
  searchInp:{flex:1,fontSize:FontSize.md,color:Colors.text},
  gruposRow:{flexGrow:0,marginBottom:Spacing.sm},
  gChip:{paddingHorizontal:12,paddingVertical:5,borderRadius:Radius.full,backgroundColor:Colors.card,marginRight:6,borderWidth:1,borderColor:Colors.border},
  gChipOn:{backgroundColor:Colors.primary,borderColor:Colors.primary},
  gChipTxt:{fontSize:FontSize.xs,color:Colors.textSecondary,fontWeight:'500'},
  gChipTxtOn:{color:'#fff'},
  ejCard:{flexDirection:'row',alignItems:'center',gap:Spacing.md,backgroundColor:Colors.card,borderRadius:Radius.md,padding:Spacing.md,marginBottom:8,...Shadow.sm},
  ejThumb:{width:40,height:40,borderRadius:10,backgroundColor:Colors.primaryLight,alignItems:'center',justifyContent:'center'},
  ejThumbTxt:{fontSize:FontSize.sm,fontWeight:'700',color:Colors.primary},
  ejNom:{fontSize:FontSize.sm,fontWeight:'600',color:Colors.text},
  ejMus:{fontSize:FontSize.xs,color:Colors.textSecondary,marginTop:2},
  empty:{textAlign:'center',color:Colors.textSecondary,marginTop:Spacing.xl},
});
