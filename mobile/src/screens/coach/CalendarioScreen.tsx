import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { CLIENTES, RUTINAS } from '../../data/mockData';
import { toIsoDate } from '../../utils/dates';

type Sesion = { clienteId:string; fecha:string; nombre:string; color:string };

const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DS=['Lu','Ma','Mi','Ju','Vi','Sa','Do'];

export default function CalendarioScreen() {
  const [cliIdx,setCliIdx]=useState(0);
  // Empieza en el mes actual (antes estaba fijo en septiembre 2026)
  const [yr,setYr]=useState(()=>new Date().getFullYear());
  const [mo,setMo]=useState(()=>new Date().getMonth());
  // TODO: cargar/guardar en Supabase. Ahora cada sesión va ligada a su cliente.
  const [sesiones,setSesiones]=useState<Sesion[]>([
    {clienteId:'c1',fecha:'2026-09-17',nombre:'Push A',color:'#4A5C8A'},
    {clienteId:'c1',fecha:'2026-09-19',nombre:'Pull A',color:'#16A34A'},
    {clienteId:'c1',fecha:'2026-09-24',nombre:'Legs A',color:'#D97706'},
  ]);
  const [modal,setModal]=useState(false);
  const [fechaSel,setFechaSel]=useState('');
  const [nomSesion,setNomSesion]=useState('');
  const [rutIdx,setRutIdx]=useState(0);

  const firstDay=(new Date(yr,mo,1).getDay()+6)%7;
  const diasMes=new Date(yr,mo+1,0).getDate();
  const today=new Date();

  const cliente=CLIENTES[cliIdx];

  const guardar=()=>{
    if(!nomSesion.trim()){Alert.alert('Error','Añade un nombre');return;}
    setSesiones(prev=>[...prev,{clienteId:cliente.id,fecha:fechaSel,nombre:nomSesion.trim(),color:RUTINAS[rutIdx]?.color||Colors.primary}]);
    setModal(false);setNomSesion('');
  };

  const borrar=(x:Sesion)=>Alert.alert('Eliminar entreno',`¿Eliminar "${x.nombre}" del ${x.fecha}?`,[
    {text:'Cancelar',style:'cancel'},
    {text:'Eliminar',style:'destructive',onPress:()=>setSesiones(prev=>prev.filter(s=>s!==x))},
  ]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}><Text style={s.tit}>Calendario</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cliRow} contentContainerStyle={{paddingHorizontal:Spacing.md}}>
        {CLIENTES.map((c,i)=>(
          <TouchableOpacity key={c.id} style={[s.cliChip,cliIdx===i&&s.cliChipOn]} onPress={()=>setCliIdx(i)}>
            <Text style={[s.cliChipTxt,cliIdx===i&&s.cliChipTxtOn]}>{c.nombre.split(' ')[0]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={s.scroll}>
        <View style={s.calHdr}>
          <TouchableOpacity onPress={()=>{if(mo===0){setMo(11);setYr(yr-1);}else setMo(mo-1);}}>
            <Ionicons name="chevron-back" size={22} color={Colors.text}/>
          </TouchableOpacity>
          <Text style={s.mesLbl}>{MESES[mo]} {yr}</Text>
          <TouchableOpacity onPress={()=>{if(mo===11){setMo(0);setYr(yr+1);}else setMo(mo+1);}}>
            <Ionicons name="chevron-forward" size={22} color={Colors.text}/>
          </TouchableOpacity>
        </View>
        <View style={s.semRow}>
          {DS.map(d=><Text key={d} style={s.dHdr}>{d}</Text>)}
        </View>
        <View style={s.grid}>
          {Array.from({length:firstDay},(_,i)=><View key={'e'+i} style={s.dVacio}/>)}
          {Array.from({length:diasMes},(_,i)=>{
            const d=i+1;
            const f=toIsoDate(yr,mo,d);
            const ses=sesiones.filter(x=>x.fecha===f&&x.clienteId===cliente.id);
            const isToday=today.getDate()===d&&today.getMonth()===mo&&today.getFullYear()===yr;
            return (
              <TouchableOpacity key={d} style={[s.dCell,isToday&&s.dCellHoy]} onPress={()=>{setFechaSel(f);setNomSesion('');setModal(true);}} onLongPress={ses[0]?()=>borrar(ses[0]):undefined}>
                <Text style={[s.dNr,isToday&&{color:Colors.primary}]}>{d}</Text>
                {ses.map((x,j)=><View key={j} style={[s.sesChip,{backgroundColor:x.color}]}><Text style={s.sesChipTxt} numberOfLines={1}>{x.nombre}</Text></View>)}
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={s.hint}>Toca un día para añadir · mantén pulsado para eliminar</Text>
      </ScrollView>
      <Modal visible={modal} transparent animationType="slide" onRequestClose={()=>setModal(false)}>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS==='ios'?'padding':'height'}>
          <View style={s.modal}>
            <Text style={s.modalTit}>Añadir entreno</Text>
            <Text style={s.modalSub}>{fechaSel} · {cliente.nombre}</Text>
            <Text style={s.lbl}>Nombre del entreno</Text>
            <TextInput style={s.inp} value={nomSesion} onChangeText={setNomSesion} placeholder="Ej: Push A" placeholderTextColor={Colors.textLight}/>
            <Text style={s.lbl}>Rutina</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {RUTINAS.map((r,i)=>(
                <TouchableOpacity key={r.id} style={[s.rutChip,rutIdx===i&&{backgroundColor:r.color}]} onPress={()=>{setRutIdx(i);setNomSesion(r.nombre);}}>
                  <Text style={[s.rutChipTxt,rutIdx===i&&{color:'#fff'}]}>{r.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={()=>setModal(false)}><Text style={{color:Colors.text}}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={s.addBtn} onPress={guardar}><Text style={{color:'#fff',fontWeight:'600'}}>Añadir</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.background},
  scroll:{flex:1,padding:Spacing.md},
  hdr:{padding:Spacing.md,paddingBottom:0},
  tit:{fontSize:FontSize.xxl,fontWeight:'700',color:Colors.text},
  cliRow:{paddingVertical:Spacing.sm,flexGrow:0},
  cliChip:{paddingHorizontal:14,paddingVertical:6,borderRadius:Radius.full,backgroundColor:Colors.card,marginRight:8,borderWidth:1,borderColor:Colors.border},
  cliChipOn:{backgroundColor:Colors.primary,borderColor:Colors.primary},
  cliChipTxt:{fontSize:FontSize.sm,color:Colors.textSecondary,fontWeight:'500'},
  cliChipTxtOn:{color:'#fff'},
  calHdr:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:Spacing.md},
  mesLbl:{fontSize:FontSize.lg,fontWeight:'600',color:Colors.text},
  semRow:{flexDirection:'row',marginBottom:4},
  dHdr:{flex:1,textAlign:'center',fontSize:FontSize.xs,color:Colors.textSecondary,fontWeight:'600'},
  grid:{flexDirection:'row',flexWrap:'wrap'},
  dVacio:{width:'14.28%',height:68},
  dCell:{width:'14.28%',minHeight:68,borderWidth:0.5,borderColor:Colors.border,padding:3,backgroundColor:Colors.card},
  dCellHoy:{borderColor:Colors.primary,borderWidth:2},
  dNr:{fontSize:11,fontWeight:'600',color:Colors.text,marginBottom:2},
  sesChip:{borderRadius:3,paddingHorizontal:2,paddingVertical:1,marginTop:1},
  sesChipTxt:{fontSize:9,color:'#fff',fontWeight:'600'},
  hint:{fontSize:FontSize.xs,color:Colors.textLight,textAlign:'center',marginTop:Spacing.md,marginBottom:Spacing.xl},
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'},
  modal:{backgroundColor:Colors.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:Spacing.lg},
  modalTit:{fontSize:FontSize.xl,fontWeight:'700',color:Colors.text,marginBottom:4},
  modalSub:{fontSize:FontSize.sm,color:Colors.textSecondary,marginBottom:Spacing.md},
  lbl:{fontSize:FontSize.sm,color:Colors.textSecondary,fontWeight:'500',marginBottom:6,marginTop:Spacing.sm},
  inp:{backgroundColor:Colors.background,borderRadius:Radius.md,padding:Spacing.md,fontSize:FontSize.md,color:Colors.text,borderWidth:1,borderColor:Colors.border,marginBottom:Spacing.sm},
  rutChip:{paddingHorizontal:12,paddingVertical:6,borderRadius:Radius.full,backgroundColor:Colors.background,marginRight:8,borderWidth:1,borderColor:Colors.border},
  rutChipTxt:{fontSize:FontSize.sm,color:Colors.textSecondary,fontWeight:'500'},
  modalBtns:{flexDirection:'row',gap:Spacing.sm,marginTop:Spacing.lg},
  cancelBtn:{flex:1,padding:Spacing.md,borderRadius:Radius.md,backgroundColor:Colors.background,alignItems:'center'},
  addBtn:{flex:1,padding:Spacing.md,borderRadius:Radius.md,backgroundColor:Colors.primary,alignItems:'center'},
});
