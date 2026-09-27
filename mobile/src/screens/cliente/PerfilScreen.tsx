import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useAuth, useClientId } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import * as api from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { openLink } from '../../utils/openLink';
import { DIAS_DOMINGO_PRIMERO } from '../../utils/dates';
import { CONTACT_EMAIL, WEB_URL } from '../../config';
import type { ClienteTabsParams } from '../../navigation/MainNavigator';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const clientId = useClientId();
  const route = useRoute<RouteProp<ClienteTabsParams, 'Perfil'>>();
  const { data: checkins, loading } = useAsync(() => api.fetchMyCheckins(clientId), [clientId]);
  const [abierto, setAbierto] = useState<api.CheckinSchedule | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const abrir = (c: api.CheckinSchedule) => { setRespuestas({}); setAbierto(c); };

  // Llegar desde la tarjeta de check-in de Inicio: abre el de hoy (o el primero)
  useEffect(() => {
    if (!route.params?.abrirCheckin || !checkins?.length) return;
    const hoy = new Date().getDay();
    abrir(checkins.find(c => c.day_of_week === hoy) ?? checkins[0]);
  }, [route.params?.abrirCheckin, route.params?.ts, checkins]);

  const enviar = async () => {
    const t = abierto?.template;
    if (!t || enviando) return;
    const answers: Record<string, string> = {};
    for (const q of t.questions) answers[q.label] = (respuestas[q.id] ?? '').trim();
    if (Object.values(answers).every(v => !v)) { Alert.alert('Check-in vacío', 'Responde al menos una pregunta.'); return; }
    setEnviando(true);
    try {
      await api.submitCheckin(clientId, t.id, answers);
      setAbierto(null);
      Alert.alert('Check-in enviado', 'Chris lo revisará pronto 💪');
    } catch (e) {
      Alert.alert('No se ha enviado', e instanceof Error ? e.message : 'Revisa tu conexión.');
    } finally {
      setEnviando(false);
    }
  };

  const confirmarLogout = () => Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Salir', style: 'destructive', onPress: () => { void logout(); } },
  ]);

  const solicitarBaja = () => Alert.alert(
    'Eliminar mi cuenta',
    'Se borrarán tu cuenta, tus registros y tus fotos de progreso. Se enviará la solicitud a Chris.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Solicitar eliminación', style: 'destructive',
        onPress: () => openLink(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Eliminar mi cuenta')}&body=${encodeURIComponent(`Solicito la eliminación de mi cuenta y de todos mis datos.\n\nNombre: ${user?.nombre}\nEmail: ${user?.email}`)}`),
      },
    ],
  );

  const menu = [
    WEB_URL ? { ico: 'key-outline', lbl: 'Cambiar contraseña', onPress: () => openLink(`${WEB_URL}/recuperar`) } : null,
    WEB_URL ? { ico: 'shield-checkmark-outline', lbl: 'Política de privacidad', onPress: () => openLink(`${WEB_URL}/privacidad`) } : null,
    CONTACT_EMAIL ? { ico: 'trash-outline', lbl: 'Eliminar mi cuenta', onPress: solicitarBaja } : null,
  ].filter(Boolean) as { ico: keyof typeof Ionicons.glyphMap; lbl: string; onPress: () => void }[];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.hdr}><Text style={s.tit}>Perfil</Text></View>
      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        <View style={s.avCard}>
          <View style={s.av}><Text style={s.avTxt}>{user?.nombre?.charAt(0)}</Text></View>
          <Text style={s.nom}>{user?.nombre}</Text>
          <Text style={s.email}>{user?.email}</Text>
        </View>

        <Text style={s.section}>Check-ins</Text>
        <View style={s.menuCard}>
          {loading ? <ActivityIndicator color={Colors.primary} style={{ padding: Spacing.md }} /> :
            !checkins?.length ? <Text style={s.menuEmpty}>Chris aún no te ha asignado check-ins.</Text> :
            checkins.map(c => (
              <TouchableOpacity key={c.id} style={s.menuRow} onPress={() => abrir(c)}>
                <Ionicons name="clipboard-outline" size={20} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={s.menuTxt}>{c.template?.name ?? 'Check-in'}</Text>
                  <Text style={s.menuSub}>Toca los {DIAS_DOMINGO_PRIMERO[c.day_of_week]?.toLowerCase()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
        </View>

        {menu.length > 0 && (
          <View style={s.menuCard}>
            {menu.map(m => (
              <TouchableOpacity key={m.lbl} style={s.menuRow} onPress={m.onPress}>
                <Ionicons name={m.ico} size={20} color={Colors.primary} />
                <Text style={[s.menuTxt, { flex: 1 }]}>{m.lbl}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={s.logoutBtn} onPress={confirmarLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={s.logoutTxt}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!abierto} transparent animationType="slide" onRequestClose={() => setAbierto(null)}>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView style={s.modal} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: Spacing.xl }}>
            <Text style={s.modalTit}>{abierto?.template?.name ?? 'Check-in'}</Text>
            {abierto?.template?.questions.map(q => (
              <View key={q.id} style={{ marginBottom: Spacing.md }}>
                <Text style={s.qLbl}>{q.label}</Text>
                <TextInput
                  style={s.qInp}
                  accessibilityLabel={q.label}
                  multiline={q.type !== 'number'}
                  keyboardType={q.type === 'number' ? 'decimal-pad' : 'default'}
                  value={respuestas[q.id] ?? ''}
                  onChangeText={v => setRespuestas(r => ({ ...r, [q.id]: v }))}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            ))}
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setAbierto(null)}><Text style={{ color: Colors.text }}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={s.enviarBtn} onPress={enviar} disabled={enviando}>
                {enviando ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Enviar</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, padding: Spacing.md },
  hdr: { padding: Spacing.md, paddingBottom: 0 },
  tit: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  avCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md, ...Shadow.sm },
  av: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avTxt: { fontSize: FontSize.xxl, fontWeight: '700', color: '#fff' },
  nom: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  section: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm, marginLeft: 4 },
  menuCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, marginBottom: Spacing.md, ...Shadow.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.sep },
  menuTxt: { fontSize: FontSize.md, color: Colors.text },
  menuSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  menuEmpty: { padding: Spacing.md, fontSize: FontSize.sm, color: Colors.textSecondary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md },
  logoutTxt: { fontSize: FontSize.md, color: Colors.error, fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { flexGrow: 0, maxHeight: '90%', backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg },
  modalTit: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  qLbl: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text, marginBottom: 6 },
  qInp: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text, minHeight: 48, textAlignVertical: 'top', borderWidth: 1, borderColor: Colors.border },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.background, alignItems: 'center' },
  enviarBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center' },
});
