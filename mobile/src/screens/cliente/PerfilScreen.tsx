import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { ClienteTabsParams } from '../../navigation/MainNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const route = useRoute<RouteProp<ClienteTabsParams,'Perfil'>>();
  const [showCI, setShowCI] = useState(false);
  const [energia, setEnergia] = useState(7);
  const [fuerza, setFuerza] = useState(7);
  const [sueno, setSueno] = useState(7);
  const [comentario, setComentario] = useState('');

  // Llegar desde la tarjeta "Check-in semanal" de Inicio
  useEffect(() => { if (route.params?.abrirCheckin) setShowCI(true); }, [route.params?.abrirCheckin, route.params?.ts]);

  const enviarCI = () => {
    // TODO: guardar en Supabase (tabla check-ins) cuando se conecte el backend
    Alert.alert('Check-in enviado','Chris revisará tu check-in pronto 💪');
    setShowCI(false); setComentario(''); setEnergia(7); setFuerza(7); setSueno(7);
  };

  const confirmarLogout = () => Alert.alert('Cerrar sesión','¿Seguro que quieres salir?',[
    {text:'Cancelar',style:'cancel'},
    {text:'Salir',style:'destructive',onPress:()=>{ void logout(); }},
  ]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}><Text style={s.tit}>Perfil</Text></View>
      <ScrollView style={s.scroll}>
        <View style={s.avCard}>
          <View style={s.av}><Text style={s.avTxt}>{user?.nombre?.charAt(0)}</Text></View>
          <Text style={s.nom}>{user?.nombre}</Text>
          <Text style={s.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={s.ciBtn} onPress={()=>setShowCI(true)}>
          <Ionicons name="clipboard-outline" size={22} color="#fff"/>
          <Text style={s.ciBtnTxt}>Enviar check-in semanal</Text>
        </TouchableOpacity>
        <View style={s.menuCard}>
          {[{ico:'notifications-outline',lbl:'Notificaciones'},{ico:'camera-outline',lbl:'Fotos de progreso'},{ico:'chatbubble-outline',lbl:'Mensajes con Chris'},{ico:'settings-outline',lbl:'Ajustes'}].map((m,i)=>(
            <TouchableOpacity key={i} style={s.menuRow} onPress={()=>Alert.alert(m.lbl,'Próximamente')}>
              <Ionicons name={m.ico as any} size={20} color={Colors.primary}/>
              <Text style={s.menuTxt}>{m.lbl}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight}/>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={confirmarLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error}/>
          <Text style={s.logoutTxt}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={showCI} transparent animationType="slide" onRequestClose={()=>setShowCI(false)}>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS==='ios'?'padding':'height'}>
          <ScrollView style={s.modal} keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom:Spacing.lg}}>
            <Text style={s.modalTit}>Check-in semanal</Text>
            {[{l:'Energía',v:energia,s:setEnergia},{l:'Fuerza',v:fuerza,s:setFuerza},{l:'Sueño',v:sueno,s:setSueno}].map(m=>(
              <View key={m.l} style={{marginBottom:Spacing.md}}>
                <Text style={s.sliderLbl}>{m.l}: <Text style={{color:Colors.primary,fontWeight:'700'}}>{m.v}/10</Text></Text>
                <View style={s.numRow}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                    <TouchableOpacity key={n} style={[s.numBtn,m.v===n&&s.numBtnOn]} onPress={()=>m.s(n)}>
                      <Text style={[s.numBtnTxt,m.v===n&&{color:'#fff'}]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            <TextInput style={s.comentario} multiline placeholder="¿Cómo fue tu semana?" value={comentario} onChangeText={setComentario} placeholderTextColor={Colors.textLight}/>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={()=>setShowCI(false)}><Text style={{color:Colors.text}}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={s.enviarBtn} onPress={enviarCI}><Text style={{color:'#fff',fontWeight:'600'}}>Enviar</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.background},
  scroll:{flex:1,padding:Spacing.md},
  hdr:{padding:Spacing.md,paddingBottom:0},
  tit:{fontSize:FontSize.xxl,fontWeight:'700',color:Colors.text},
  avCard:{backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.lg,alignItems:'center',marginBottom:Spacing.md,...Shadow.sm},
  av:{width:72,height:72,borderRadius:36,backgroundColor:Colors.primary,alignItems:'center',justifyContent:'center',marginBottom:Spacing.md},
  avTxt:{fontSize:FontSize.xxl,fontWeight:'700',color:'#fff'},
  nom:{fontSize:FontSize.xl,fontWeight:'700',color:Colors.text},
  email:{fontSize:FontSize.sm,color:Colors.textSecondary,marginTop:4},
  ciBtn:{backgroundColor:Colors.primary,borderRadius:Radius.lg,padding:Spacing.md,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:Spacing.sm,marginBottom:Spacing.md},
  ciBtnTxt:{color:'#fff',fontSize:FontSize.md,fontWeight:'600'},
  menuCard:{backgroundColor:Colors.card,borderRadius:Radius.lg,marginBottom:Spacing.md,...Shadow.sm},
  menuRow:{flexDirection:'row',alignItems:'center',gap:Spacing.md,padding:Spacing.md,borderBottomWidth:1,borderBottomColor:Colors.border},
  menuTxt:{flex:1,fontSize:FontSize.md,color:Colors.text},
  logoutBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:Spacing.sm,padding:Spacing.md,marginBottom:Spacing.xxl},
  logoutTxt:{fontSize:FontSize.md,color:Colors.error,fontWeight:'500'},
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'},
  modal:{flexGrow:0,maxHeight:'90%',backgroundColor:Colors.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:Spacing.lg},
  modalTit:{fontSize:FontSize.xl,fontWeight:'700',color:Colors.text,marginBottom:Spacing.md},
  sliderLbl:{fontSize:FontSize.sm,fontWeight:'500',color:Colors.text,marginBottom:6},
  numRow:{flexDirection:'row',flexWrap:'wrap',gap:4},
  numBtn:{width:30,height:30,borderRadius:15,backgroundColor:Colors.background,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:Colors.border},
  numBtnOn:{backgroundColor:Colors.primary,borderColor:Colors.primary},
  numBtnTxt:{fontSize:11,fontWeight:'600',color:Colors.text},
  comentario:{backgroundColor:Colors.background,borderRadius:Radius.md,padding:Spacing.md,fontSize:FontSize.sm,color:Colors.text,minHeight:80,textAlignVertical:'top',marginBottom:Spacing.md,borderWidth:1,borderColor:Colors.border},
  modalBtns:{flexDirection:'row',gap:Spacing.sm},
  cancelBtn:{flex:1,padding:Spacing.md,borderRadius:Radius.md,backgroundColor:Colors.background,alignItems:'center'},
  enviarBtn:{flex:1,padding:Spacing.md,borderRadius:Radius.md,backgroundColor:Colors.primary,alignItems:'center'},
});
