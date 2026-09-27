import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RUTINAS, PLAN_SEMANA } from '../../data/mockData';
import { diaDeHoy } from '../../utils/dates';
import type { ClienteTabsParams } from '../../navigation/MainNavigator';

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<ClienteTabsParams>>();
  // Se recalcula al volver a la pantalla (antes se calculaba una sola vez al cargar el módulo)
  const focused = useIsFocused();
  const hoy = useMemo(() => diaDeHoy(), [focused]);
  const planHoy = PLAN_SEMANA.find(p=>p.dia===hoy);
  const rutinaHoy = planHoy?.rutinaId ? RUTINAS.find(r=>r.id===planHoy.rutinaId) : null;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hola, {user?.nombre?.split(' ')[0]} 👋</Text>
            <Text style={s.date}>{new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</Text>
          </View>
          <View style={s.av}><Text style={s.avTxt}>{user?.nombre?.charAt(0)}</Text></View>
        </View>

        <View style={s.card}>
          <Text style={s.cardLbl}>ENTRENO DE HOY</Text>
          {rutinaHoy ? (
            <>
              <View style={[s.tag,{backgroundColor:rutinaHoy.color+'22'}]}>
                <Text style={[s.tagTxt,{color:rutinaHoy.color}]}>{rutinaHoy.nombre}</Text>
              </View>
              <Text style={s.desc}>{rutinaHoy.descripcion}</Text>
              <Text style={s.ejs}>{rutinaHoy.ejercicios.length} ejercicios · ~45-60 min</Text>
              <TouchableOpacity style={[s.btnStart,{backgroundColor:rutinaHoy.color}]} onPress={()=>navigation.navigate('Entreno',{rutinaId:rutinaHoy.id,ts:Date.now()})}>
                <Ionicons name="play" size={16} color="#fff"/>
                <Text style={s.btnStartTxt}>Iniciar entreno</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={s.rest}>
              <Ionicons name="moon-outline" size={36} color={Colors.textLight}/>
              <Text style={s.restTxt}>Día de descanso</Text>
              <Text style={s.restSub}>Descansa y recupera bien</Text>
            </View>
          )}
        </View>

        <Text style={s.sectionTit}>Esta semana</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:Spacing.md}}>
          {PLAN_SEMANA.map(p=>{
            const r=p.rutinaId?RUTINAS.find(x=>x.id===p.rutinaId):null;
            const esHoy=p.dia===hoy;
            return (
              <View key={p.dia} style={[s.diaCard,esHoy&&s.diaCardHoy]}>
                <Text style={[s.diaNom,esHoy&&{color:Colors.primary}]}>{p.dia.slice(0,3)}</Text>
                {r?<View style={[s.diaRut,{backgroundColor:r.color}]}><Text style={s.diaRutTxt}>{r.nombre}</Text></View>
                  :<View style={s.diaDesc}><Text style={{fontSize:10,color:Colors.textLight}}>—</Text></View>}
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={s.ciCard} onPress={()=>navigation.navigate('Perfil',{abrirCheckin:true,ts:Date.now()})}>
          <View style={{flexDirection:'row',alignItems:'center',gap:Spacing.md}}>
            <Ionicons name="clipboard-outline" size={24} color={Colors.primary}/>
            <View>
              <Text style={s.ciTit}>Check-in semanal</Text>
              <Text style={s.ciSub}>Cuéntale cómo te fue a Chris</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight}/>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.background},
  scroll:{flex:1,padding:Spacing.md},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:Spacing.lg},
  greeting:{fontSize:FontSize.xl,fontWeight:'700',color:Colors.text},
  date:{fontSize:FontSize.sm,color:Colors.textSecondary,marginTop:2,textTransform:'capitalize'},
  av:{width:44,height:44,borderRadius:22,backgroundColor:Colors.primary,alignItems:'center',justifyContent:'center'},
  avTxt:{color:'#fff',fontSize:FontSize.lg,fontWeight:'700'},
  card:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,marginBottom:Spacing.md,...Shadow.md},
  cardLbl:{fontSize:FontSize.xs,color:Colors.textLight,fontWeight:'700',letterSpacing:0.5,marginBottom:Spacing.sm},
  tag:{alignSelf:'flex-start',borderRadius:Radius.sm,paddingHorizontal:10,paddingVertical:4,marginBottom:8},
  tagTxt:{fontSize:FontSize.sm,fontWeight:'700'},
  desc:{fontSize:FontSize.sm,color:Colors.textSecondary,marginBottom:4},
  ejs:{fontSize:FontSize.xs,color:Colors.textLight,marginBottom:Spacing.md},
  btnStart:{flexDirection:'row',alignItems:'center',justifyContent:'center',borderRadius:Radius.md,padding:Spacing.md,gap:8},
  btnStartTxt:{color:'#fff',fontSize:FontSize.md,fontWeight:'600'},
  rest:{alignItems:'center',padding:Spacing.lg},
  restTxt:{fontSize:FontSize.lg,fontWeight:'600',color:Colors.text,marginTop:Spacing.sm},
  restSub:{fontSize:FontSize.sm,color:Colors.textSecondary,marginTop:4},
  sectionTit:{fontSize:FontSize.md,fontWeight:'600',color:Colors.text,marginBottom:Spacing.sm},
  diaCard:{backgroundColor:Colors.card,borderRadius:Radius.md,padding:Spacing.sm,marginRight:8,minWidth:72,alignItems:'center',...Shadow.sm},
  diaCardHoy:{borderWidth:2,borderColor:Colors.primary},
  diaNom:{fontSize:FontSize.xs,fontWeight:'600',color:Colors.textSecondary,marginBottom:6},
  diaRut:{borderRadius:4,paddingHorizontal:6,paddingVertical:3},
  diaRutTxt:{fontSize:10,fontWeight:'700',color:'#fff'},
  diaDesc:{borderRadius:4,paddingHorizontal:6,paddingVertical:3,backgroundColor:Colors.background},
  ciCard:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:Spacing.xl,...Shadow.sm},
  ciTit:{fontSize:FontSize.md,fontWeight:'600',color:Colors.text},
  ciSub:{fontSize:FontSize.xs,color:Colors.textSecondary,marginTop:2},
});
