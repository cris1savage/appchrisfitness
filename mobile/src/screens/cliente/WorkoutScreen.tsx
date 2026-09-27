import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { RUTINAS } from '../../data/mockData';
import { openLink } from '../../utils/openLink';
import type { ClienteTabsParams } from '../../navigation/MainNavigator';

type Rutina = (typeof RUTINAS)[number];
type SerieHecha = { ej:number; serie:number; peso:string; reps:string };

/** Acepta "72,5" o "72.5" (teclado español) y devuelve número válido o null */
const parseNum = (v:string) => { const n = Number(v.replace(',','.')); return v.trim()!=='' && Number.isFinite(n) && n>=0 ? n : null; };

export default function WorkoutScreen() {
  const route = useRoute<RouteProp<ClienteTabsParams,'Entreno'>>();
  const [sesion, setSesion] = useState<Rutina|null>(null);
  const [ejIdx, setEjIdx] = useState(0);
  const [serieIdx, setSerieIdx] = useState(0);
  const [peso, setPeso] = useState('');
  const [reps, setReps] = useState('');
  const [modal, setModal] = useState(false);
  const [completados, setCompletados] = useState<SerieHecha[]>([]);

  const iniciar = (r:Rutina) => { setSesion(r); setEjIdx(0); setSerieIdx(0); setCompletados([]); setPeso(''); setReps(''); };

  // Llegar desde "Iniciar entreno" en Inicio
  useEffect(() => {
    const id = route.params?.rutinaId;
    const r = id ? RUTINAS.find(x=>x.id===id) : undefined;
    if (r) iniciar(r);
  }, [route.params?.rutinaId, route.params?.ts]);

  const salir = () => {
    if (!completados.length) { setSesion(null); return; }
    Alert.alert('¿Salir del entreno?','Perderás las series registradas.',[
      {text:'Seguir entrenando',style:'cancel'},
      {text:'Salir',style:'destructive',onPress:()=>setSesion(null)},
    ]);
  };

  const registrar = () => {
    if (!sesion) return;
    const p = parseNum(peso), r = parseNum(reps);
    if (p===null || r===null) { Alert.alert('Datos incompletos','Introduce el peso y las repeticiones.'); return; }
    const nuevos = [...completados, {ej:ejIdx,serie:serieIdx,peso:String(p),reps:String(r)}];
    setCompletados(nuevos);
    const ej = sesion.ejercicios[ejIdx];
    if (serieIdx < ej.series-1) setSerieIdx(serieIdx+1);
    else if (ejIdx < sesion.ejercicios.length-1) { setEjIdx(ejIdx+1); setSerieIdx(0); }
    else { Alert.alert('¡Entreno completado!','Buen trabajo 💪'); setSesion(null); }
    setPeso(''); setReps(''); setModal(false);
  };

  if (sesion) {
    const ej = sesion.ejercicios[ejIdx];
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.sesHdr}>
          <TouchableOpacity onPress={salir} hitSlop={12}><Ionicons name="close" size={24} color={Colors.text}/></TouchableOpacity>
          <Text style={s.sesTit}>{sesion.nombre}</Text>
          <Text style={s.sesProg}>{ejIdx+1}/{sesion.ejercicios.length}</Text>
        </View>
        <ScrollView style={s.scroll}>
          <View style={s.ejCard}>
            <Text style={s.ejNom}>{ej.nombre}</Text>
            <Text style={s.ejDet}>{ej.reps} reps · {ej.descanso} descanso · RIR {ej.rir}</Text>
            {ej.video?<TouchableOpacity style={s.vidBtn} onPress={()=>openLink(ej.video)}>
              <Ionicons name="play-circle" size={20} color={Colors.primary}/>
              <Text style={s.vidTxt}>Ver vídeo</Text>
            </TouchableOpacity>:null}
          </View>
          <Text style={s.seriesTit}>Series</Text>
          {Array.from({length:ej.series},(_,i)=>{
            const done = completados.find(c=>c.ej===ejIdx&&c.serie===i);
            const current = i===serieIdx;
            return (
              <TouchableOpacity key={i} style={[s.serieRow,current&&s.serieRowActive,done&&s.serieRowDone]} onPress={()=>{if(current)setModal(true);}}>
                <View style={[s.serieNum,done&&{backgroundColor:Colors.success}]}>
                  {done?<Ionicons name="checkmark" size={14} color="#fff"/>:<Text style={s.serieNumTxt}>{i+1}</Text>}
                </View>
                <View style={{flex:1}}>
                  <Text style={s.serieLbl}>Serie {i+1} · {ej.reps} reps</Text>
                  {done&&<Text style={s.serieRes}>{done.peso}kg · {done.reps} reps</Text>}
                </View>
                {current&&<Text style={s.serieReg}>Registrar</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Modal visible={modal} transparent animationType="slide" onRequestClose={()=>setModal(false)}>
          <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS==='ios'?'padding':'height'}>
            <View style={s.modalBox}>
              <Text style={s.modalTit}>Serie {serieIdx+1} — {ej.nombre}</Text>
              <Text style={s.modalLbl}>Peso (kg)</Text>
              <TextInput style={s.modalInp} value={peso} onChangeText={setPeso} keyboardType="decimal-pad" placeholder="0" autoFocus placeholderTextColor={Colors.textLight}/>
              <Text style={s.modalLbl}>Reps completadas</Text>
              <TextInput style={s.modalInp} value={reps} onChangeText={setReps} keyboardType="number-pad" placeholder={ej.reps} placeholderTextColor={Colors.textLight}/>
              <View style={s.modalBtns}>
                <TouchableOpacity style={s.modalCancel} onPress={()=>setModal(false)}><Text style={{color:Colors.text}}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={s.modalConfirm} onPress={registrar}><Text style={{color:'#fff',fontWeight:'600'}}>Confirmar</Text></TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}><Text style={s.tit}>Entrenamientos</Text></View>
      <ScrollView style={s.scroll}>
        {RUTINAS.map(r=>(
          <View key={r.id} style={s.rutCard}>
            <View style={[s.rutBar,{backgroundColor:r.color}]}/>
            <View style={{flex:1}}>
              <Text style={s.rutNom}>{r.nombre}</Text>
              <Text style={s.rutDesc}>{r.descripcion}</Text>
              <Text style={s.rutEjs}>{r.ejercicios.length} ejercicios</Text>
            </View>
            <TouchableOpacity style={[s.btnIni,{backgroundColor:r.color}]} onPress={()=>iniciar(r)}>
              <Text style={s.btnIniTxt}>Iniciar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.background},
  scroll:{flex:1,padding:Spacing.md},
  hdr:{padding:Spacing.md,paddingBottom:0},
  tit:{fontSize:FontSize.xxl,fontWeight:'700',color:Colors.text},
  rutCard:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,marginBottom:Spacing.md,flexDirection:'row',alignItems:'center',gap:Spacing.md,...Shadow.sm},
  rutBar:{width:6,height:52,borderRadius:3},
  rutNom:{fontSize:FontSize.md,fontWeight:'700',color:Colors.text},
  rutDesc:{fontSize:FontSize.sm,color:Colors.textSecondary,marginTop:2},
  rutEjs:{fontSize:FontSize.xs,color:Colors.textLight,marginTop:2},
  btnIni:{borderRadius:Radius.md,paddingHorizontal:16,paddingVertical:8},
  btnIniTxt:{color:'#fff',fontWeight:'600',fontSize:FontSize.sm},
  sesHdr:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:Spacing.md,backgroundColor:Colors.card,borderBottomWidth:1,borderBottomColor:Colors.border},
  sesTit:{fontSize:FontSize.lg,fontWeight:'700',color:Colors.text},
  sesProg:{fontSize:FontSize.sm,color:Colors.textSecondary},
  ejCard:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,margin:Spacing.md,...Shadow.sm},
  ejNom:{fontSize:FontSize.xl,fontWeight:'700',color:Colors.text,marginBottom:4},
  ejDet:{fontSize:FontSize.sm,color:Colors.textSecondary},
  vidBtn:{flexDirection:'row',alignItems:'center',gap:6,marginTop:Spacing.sm},
  vidTxt:{fontSize:FontSize.sm,color:Colors.primary,fontWeight:'500'},
  seriesTit:{fontSize:FontSize.md,fontWeight:'600',color:Colors.text,paddingHorizontal:Spacing.md,marginBottom:8},
  serieRow:{flexDirection:'row',alignItems:'center',gap:Spacing.md,backgroundColor:Colors.card,marginHorizontal:Spacing.md,marginBottom:8,borderRadius:Radius.md,padding:Spacing.md},
  serieRowActive:{borderWidth:2,borderColor:Colors.primary},
  serieRowDone:{opacity:0.6},
  serieNum:{width:28,height:28,borderRadius:14,backgroundColor:Colors.border,alignItems:'center',justifyContent:'center'},
  serieNumTxt:{fontSize:FontSize.sm,fontWeight:'700',color:Colors.text},
  serieLbl:{fontSize:FontSize.sm,fontWeight:'500',color:Colors.text},
  serieRes:{fontSize:FontSize.xs,color:Colors.success,marginTop:2},
  serieReg:{fontSize:FontSize.sm,color:Colors.primary,fontWeight:'600'},
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'},
  modalBox:{backgroundColor:Colors.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:Spacing.lg},
  modalTit:{fontSize:FontSize.lg,fontWeight:'700',color:Colors.text,marginBottom:Spacing.md},
  modalLbl:{fontSize:FontSize.sm,color:Colors.textSecondary,marginBottom:6,marginTop:Spacing.sm},
  modalInp:{backgroundColor:Colors.background,borderRadius:Radius.md,padding:Spacing.md,fontSize:FontSize.xl,fontWeight:'700',textAlign:'center',borderWidth:1,borderColor:Colors.border},
  modalBtns:{flexDirection:'row',gap:Spacing.sm,marginTop:Spacing.lg},
  modalCancel:{flex:1,padding:Spacing.md,borderRadius:Radius.md,backgroundColor:Colors.background,alignItems:'center'},
  modalConfirm:{flex:1,padding:Spacing.md,borderRadius:Radius.md,backgroundColor:Colors.primary,alignItems:'center'},
});
