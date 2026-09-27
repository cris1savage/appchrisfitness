import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { CLIENTES, CHECKINS } from '../../data/mockData';
import { parseLocalDate } from '../../utils/dates';

export default function CoachDashboard() {
  const { user } = useAuth();
  const pendientes = CHECKINS.filter(c=>!c.respondido);
  const adhMedia = CLIENTES.length ? Math.round(CLIENTES.reduce((a,c)=>a+c.adh,0)/CLIENTES.length) : 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}>
        <View><Text style={s.tit}>Hola, {user?.nombre} 👋</Text><Text style={s.sub}>{CLIENTES.length} clientes activos</Text></View>
        <View style={s.av}><Text style={s.avTxt}>{user?.nombre?.charAt(0)}</Text></View>
      </View>
      <ScrollView style={s.scroll}>
        <View style={s.statsRow}>
          {[{v:CLIENTES.length,l:'Clientes',c:Colors.primary},{v:pendientes.length,l:'Check-ins pendientes',c:Colors.warning},{v:`${adhMedia}%`,l:'Adherencia media',c:Colors.success}].map(st=>(
            <View key={st.l} style={s.statCard}>
              <Text style={[s.statVal,{color:st.c}]}>{st.v}</Text>
              <Text style={s.statLbl}>{st.l}</Text>
            </View>
          ))}
        </View>
        {pendientes.length>0&&(
          <View style={s.card}>
            <Text style={s.cardTit}>Check-ins pendientes</Text>
            {pendientes.map(ci=>{
              const cli=CLIENTES.find(c=>c.id===ci.clienteId);
              return (
                <TouchableOpacity key={ci.id} style={s.ciRow} onPress={()=>Alert.alert(cli?.nombre||'',ci.comentario||'')}>
                  <View style={s.ciAv}><Text style={s.ciAvTxt}>{cli?.nombre.charAt(0)}</Text></View>
                  <View style={{flex:1}}>
                    <Text style={s.ciNom}>{cli?.nombre}</Text>
                    <Text style={s.ciDate}>{parseLocalDate(ci.fecha).toLocaleDateString('es-ES',{day:'numeric',month:'long'})}</Text>
                  </View>
                  <Text style={s.ciPeso}>{ci.peso} kg</Text>
                  <View style={s.badge}><Text style={s.badgeTxt}>Pendiente</Text></View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={s.card}>
          <Text style={s.cardTit}>Mis clientes</Text>
          {CLIENTES.map(c=>(
            <View key={c.id} style={s.cliRow}>
              <View style={s.cliAv}><Text style={s.cliAvTxt}>{c.nombre.charAt(0)}</Text></View>
              <View style={{flex:1}}>
                <Text style={s.cliNom}>{c.nombre}</Text>
                <Text style={s.cliSub}>{c.obj} · {c.adh}% adherencia</Text>
              </View>
              <Text style={s.cliPeso}>{c.peso} kg</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.background},
  scroll:{flex:1,padding:Spacing.md},
  hdr:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:Spacing.md},
  tit:{fontSize:FontSize.xl,fontWeight:'700',color:Colors.text},
  sub:{fontSize:FontSize.sm,color:Colors.textSecondary,marginTop:2},
  av:{width:40,height:40,borderRadius:20,backgroundColor:Colors.primary,alignItems:'center',justifyContent:'center'},
  avTxt:{color:'#fff',fontSize:FontSize.lg,fontWeight:'700'},
  statsRow:{flexDirection:'row',gap:Spacing.sm,marginBottom:Spacing.md},
  statCard:{flex:1,backgroundColor:Colors.card,borderRadius:Radius.md,padding:Spacing.md,alignItems:'center',...Shadow.sm},
  statVal:{fontSize:FontSize.xl,fontWeight:'700',marginBottom:4},
  statLbl:{fontSize:FontSize.xs,color:Colors.textSecondary,textAlign:'center'},
  card:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,marginBottom:Spacing.md,...Shadow.sm},
  cardTit:{fontSize:FontSize.md,fontWeight:'600',color:Colors.text,marginBottom:Spacing.md},
  ciRow:{flexDirection:'row',alignItems:'center',gap:Spacing.sm,paddingVertical:Spacing.sm,borderBottomWidth:1,borderBottomColor:Colors.border},
  ciAv:{width:36,height:36,borderRadius:18,backgroundColor:Colors.primaryLight,alignItems:'center',justifyContent:'center'},
  ciAvTxt:{fontSize:FontSize.md,fontWeight:'700',color:Colors.primary},
  ciNom:{fontSize:FontSize.sm,fontWeight:'600',color:Colors.text},
  ciDate:{fontSize:FontSize.xs,color:Colors.textSecondary},
  ciPeso:{fontSize:FontSize.sm,fontWeight:'700',color:Colors.primary},
  badge:{backgroundColor:Colors.warningLight,borderRadius:Radius.full,paddingHorizontal:8,paddingVertical:3},
  badgeTxt:{fontSize:10,fontWeight:'600',color:Colors.warning},
  cliRow:{flexDirection:'row',alignItems:'center',gap:Spacing.sm,paddingVertical:Spacing.sm,borderBottomWidth:1,borderBottomColor:Colors.border},
  cliAv:{width:36,height:36,borderRadius:18,backgroundColor:Colors.primaryLight,alignItems:'center',justifyContent:'center'},
  cliAvTxt:{fontSize:FontSize.md,fontWeight:'700',color:Colors.primary},
  cliNom:{fontSize:FontSize.sm,fontWeight:'600',color:Colors.text},
  cliSub:{fontSize:FontSize.xs,color:Colors.textSecondary,marginTop:2},
  cliPeso:{fontSize:FontSize.sm,fontWeight:'700',color:Colors.text},
});
