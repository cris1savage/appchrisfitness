import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { RUTINAS } from '../../data/mockData';

export default function RutinasScreen() {
  const [abierta, setAbierta] = useState<string|null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}>
        <Text style={s.tit}>Rutinas</Text>
        <TouchableOpacity style={s.addBtn} onPress={()=>Alert.alert('Nueva rutina','Próximamente')}>
          <Ionicons name="add" size={20} color="#fff"/>
        </TouchableOpacity>
      </View>
      <ScrollView style={s.scroll}>
        {RUTINAS.map(r=>(
          <View key={r.id}>
            <TouchableOpacity style={s.rutCard} onPress={()=>setAbierta(abierta===r.id?null:r.id)}>
              <View style={[s.bar,{backgroundColor:r.color}]}/>
              <View style={{flex:1}}>
                <Text style={s.rutNom}>{r.nombre}</Text>
                <Text style={s.rutDesc}>{r.descripcion}</Text>
                <Text style={s.rutEjs}>{r.ejercicios.length} ejercicios</Text>
              </View>
              <Ionicons name={abierta===r.id?'chevron-up':'chevron-down'} size={20} color={Colors.textLight}/>
            </TouchableOpacity>
            {abierta===r.id&&(
              <View style={s.ejsCard}>
                {r.ejercicios.map((ej,i)=>(
                  <View key={i} style={s.ejRow}>
                    <View style={[s.ejNum,{backgroundColor:r.color+'22'}]}>
                      <Text style={[s.ejNumTxt,{color:r.color}]}>{i+1}</Text>
                    </View>
                    <View style={{flex:1}}>
                      <Text style={s.ejNom}>{ej.nombre}</Text>
                      <Text style={s.ejDet}>{ej.series}×{ej.reps} · {ej.descanso} · RIR {ej.rir}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.background},
  scroll:{flex:1,padding:Spacing.md},
  hdr:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:Spacing.md},
  tit:{fontSize:FontSize.xxl,fontWeight:'700',color:Colors.text},
  addBtn:{backgroundColor:Colors.primary,width:36,height:36,borderRadius:18,alignItems:'center',justifyContent:'center'},
  rutCard:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,marginBottom:Spacing.sm,flexDirection:'row',alignItems:'center',gap:Spacing.md,...Shadow.sm},
  bar:{width:5,height:52,borderRadius:3},
  rutNom:{fontSize:FontSize.md,fontWeight:'700',color:Colors.text},
  rutDesc:{fontSize:FontSize.sm,color:Colors.textSecondary,marginTop:2},
  rutEjs:{fontSize:FontSize.xs,color:Colors.textLight,marginTop:2},
  ejsCard:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,marginBottom:Spacing.md,...Shadow.sm},
  ejRow:{flexDirection:'row',alignItems:'center',gap:Spacing.md,paddingVertical:Spacing.sm,borderBottomWidth:1,borderBottomColor:Colors.border},
  ejNum:{width:28,height:28,borderRadius:14,alignItems:'center',justifyContent:'center'},
  ejNumTxt:{fontSize:FontSize.sm,fontWeight:'700'},
  ejNom:{fontSize:FontSize.sm,fontWeight:'600',color:Colors.text},
  ejDet:{fontSize:FontSize.xs,color:Colors.textSecondary,marginTop:2},
});
