import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';

const PLANES = [
  {nombre:'Plan Entreno',kcal:2200,p:176,c:275,g:56,comidas:[
    {n:'Desayuno',h:'08:00',ops:['Avena con frutas y proteína','Tostadas con huevos revueltos']},
    {n:'Almuerzo',h:'13:00',ops:['Arroz con pollo y verduras','Pasta con atún y tomate']},
    {n:'Merienda',h:'17:00',ops:['Yogur griego con fruta','Batido de proteína con plátano']},
    {n:'Cena',h:'20:30',ops:['Salmón con patata y ensalada','Tortilla de claras con verduras']},
  ]},
  {nombre:'Plan Descanso',kcal:1900,p:160,c:220,g:50,comidas:[
    {n:'Desayuno',h:'08:00',ops:['Huevos con aguacate','Yogur griego con avena']},
    {n:'Almuerzo',h:'13:00',ops:['Pollo con verduras al horno','Merluza con ensalada']},
    {n:'Merienda',h:'17:00',ops:['Fruta y frutos secos','Queso cottage']},
    {n:'Cena',h:'20:30',ops:['Verduras salteadas con proteína','Ensalada completa']},
  ]},
];

export default function NutricionScreen() {
  const [tab, setTab] = useState<'plan'|'registro'>('plan');
  const [planIdx, setPlanIdx] = useState(0);
  const plan = PLANES[planIdx];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}><Text style={s.tit}>Nutrición</Text></View>
      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab,tab==='plan'&&s.tabOn]} onPress={()=>setTab('plan')}><Text style={[s.tabTxt,tab==='plan'&&s.tabTxtOn]}>Plan</Text></TouchableOpacity>
        <TouchableOpacity style={[s.tab,tab==='registro'&&s.tabOn]} onPress={()=>setTab('registro')}><Text style={[s.tabTxt,tab==='registro'&&s.tabTxtOn]}>Registro</Text></TouchableOpacity>
      </View>
      <ScrollView style={s.scroll}>
        {tab==='plan'?(
          <>
            <View style={s.planSel}>
              {PLANES.map((p,i)=>(
                <TouchableOpacity key={i} style={[s.planBtn,planIdx===i&&s.planBtnOn]} onPress={()=>setPlanIdx(i)}>
                  <Text style={[s.planBtnTxt,planIdx===i&&s.planBtnTxtOn]}>{p.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.macroCard}>
              <View style={s.kcalCircle}><Text style={s.kcalNum}>{plan.kcal}</Text><Text style={s.kcalLbl}>kcal</Text></View>
              <View style={{flex:1,gap:8}}>
                {[{n:'Proteína',v:plan.p,c:'#f97316'},{n:'Carbos',v:plan.c,c:'#22c55e'},{n:'Grasas',v:plan.g,c:'#a855f7'}].map((m,i)=>(
                  <View key={i}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:2}}>
                      <Text style={{fontSize:FontSize.xs,color:Colors.textSecondary}}>{m.n}</Text>
                      <Text style={{fontSize:FontSize.xs,fontWeight:'700',color:m.c}}>{m.v}g</Text>
                    </View>
                    <View style={s.mBar}><View style={[s.mFill,{width:`${Math.min((m.v/300)*100,100)}%`,backgroundColor:m.c}]}/></View>
                  </View>
                ))}
              </View>
            </View>
            {plan.comidas.map((c,i)=>(
              <View key={i} style={s.comidaCard}>
                <View style={s.comidaHdr}>
                  <Text style={s.comidaNom}>{c.n}</Text>
                  <Text style={s.comidaH}>{c.h}</Text>
                </View>
                {c.ops.map((op,j)=>(
                  <View key={j} style={s.opRow}>
                    <Ionicons name="ellipse" size={6} color={Colors.primary}/>
                    <Text style={s.opTxt}>{op}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ):(
          <View style={s.empty}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.textLight}/>
            <Text style={s.emptyTxt}>Sin registros hoy</Text>
            <Text style={s.emptySub}>Próximamente podrás buscar alimentos</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.background},
  scroll:{flex:1,padding:Spacing.md},
  hdr:{padding:Spacing.md,paddingBottom:0},
  tit:{fontSize:FontSize.xxl,fontWeight:'700',color:Colors.text},
  tabs:{flexDirection:'row',margin:Spacing.md,backgroundColor:Colors.card,borderRadius:Radius.md,padding:4},
  tab:{flex:1,padding:Spacing.sm,alignItems:'center',borderRadius:Radius.sm-2},
  tabOn:{backgroundColor:Colors.primary},
  tabTxt:{fontSize:FontSize.sm,fontWeight:'500',color:Colors.textSecondary},
  tabTxtOn:{color:'#fff'},
  planSel:{flexDirection:'row',gap:Spacing.sm,marginBottom:Spacing.md},
  planBtn:{flex:1,padding:Spacing.sm,borderRadius:Radius.md,backgroundColor:Colors.card,alignItems:'center',borderWidth:1,borderColor:Colors.border},
  planBtnOn:{backgroundColor:Colors.primaryLight,borderColor:Colors.primary},
  planBtnTxt:{fontSize:FontSize.sm,color:Colors.textSecondary,fontWeight:'500'},
  planBtnTxtOn:{color:Colors.primary},
  macroCard:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,flexDirection:'row',alignItems:'center',gap:Spacing.md,marginBottom:Spacing.md,...Shadow.sm},
  kcalCircle:{width:72,height:72,borderRadius:36,borderWidth:5,borderColor:Colors.primary,alignItems:'center',justifyContent:'center'},
  kcalNum:{fontSize:FontSize.md,fontWeight:'800',color:Colors.text},
  kcalLbl:{fontSize:10,color:Colors.textSecondary},
  mBar:{height:3,backgroundColor:Colors.background,borderRadius:2,overflow:'hidden'},
  mFill:{height:3,borderRadius:2},
  comidaCard:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,marginBottom:Spacing.sm,...Shadow.sm},
  comidaHdr:{flexDirection:'row',justifyContent:'space-between',marginBottom:Spacing.sm},
  comidaNom:{fontSize:FontSize.md,fontWeight:'600',color:Colors.text},
  comidaH:{fontSize:FontSize.sm,color:Colors.textSecondary},
  opRow:{flexDirection:'row',alignItems:'center',gap:Spacing.sm,paddingVertical:3},
  opTxt:{fontSize:FontSize.sm,color:Colors.textSecondary,flex:1},
  empty:{alignItems:'center',padding:Spacing.xxl},
  emptyTxt:{fontSize:FontSize.lg,fontWeight:'600',color:Colors.text,marginTop:Spacing.md},
  emptySub:{fontSize:FontSize.sm,color:Colors.textSecondary,marginTop:4},
});
