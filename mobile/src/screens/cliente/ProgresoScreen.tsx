import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { useClientId } from '../../context/AuthContext';
import * as api from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { ErrorState, Loading, refresher } from '../../components/ui';
import GraficaPeso from '../../components/WeightChart';

const TIPOS = [{ v: 'frontal', l: 'Frontal' }, { v: 'lateral', l: 'Lateral' }, { v: 'espalda', l: 'Espalda' }];

export default function ProgresoScreen() {
  const clientId = useClientId();
  const { data, error, loading, refreshing, refresh, reload } = useAsync(() => api.fetchProgress(clientId), [clientId]);
  const [peso, setPeso] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [tipo, setTipo] = useState('frontal');
  const [subiendo, setSubiendo] = useState(false);

  const guardarPeso = async () => {
    const n = Number(peso.replace(',', '.'));
    if (!Number.isFinite(n) || n < 20 || n > 400) { Alert.alert('Peso no válido', 'Introduce tu peso en kg, por ejemplo 78,5.'); return; }
    setGuardando(true);
    try {
      await api.logWeight(clientId, n);
      setPeso(''); Keyboard.dismiss();
      await reload();
    } catch (e) {
      Alert.alert('No se ha guardado', e instanceof Error ? e.message : 'Revisa tu conexión.');
    } finally {
      setGuardando(false);
    }
  };

  const subirFoto = async (origen: 'camara' | 'galeria') => {
    const perm = origen === 'camara' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permiso necesario', 'Activa el acceso en los ajustes del móvil para subir fotos.'); return; }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7, allowsEditing: false };
    const res = origen === 'camara' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled || !res.assets?.[0]) return;
    setSubiendo(true);
    try {
      await api.uploadProgressPhoto(clientId, res.assets[0].uri, res.assets[0].mimeType, tipo);
      Alert.alert('Foto guardada ✓', 'Solo Chris puede verla.');
    } catch (e) {
      Alert.alert('No se ha subido la foto', e instanceof Error ? e.message : 'Revisa tu conexión.');
    } finally {
      setSubiendo(false);
    }
  };

  const logs = data?.logs ?? [];
  const goal = data?.goal;
  const actual = logs.at(-1)?.weight;
  const inicial = goal?.start_weight ?? logs[0]?.weight;
  const diff = actual != null && inicial != null ? +(actual - inicial).toFixed(1) : null;
  // Verde si el cambio va hacia el objetivo
  const haciaObjetivo = diff != null && goal ? Math.sign(diff) === Math.sign(goal.target_weight - goal.start_weight) : true;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.hdr}><Text style={s.tit}>Progreso</Text></View>
      {loading ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={reload} /> : (
        <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: Spacing.xl }} keyboardShouldPersistTaps="handled" refreshControl={refresher(refreshing, refresh)}>
          <View style={s.card}>
            <Text style={s.cardTit}>Evolución del peso</Text>
            <View style={s.pesoRow}>
              <View style={s.pesoItem}><Text style={s.pesoVal}>{actual != null ? `${actual} kg` : '—'}</Text><Text style={s.pesoLbl}>Actual</Text></View>
              <View style={s.pesoItem}>
                <Text style={[s.pesoVal, diff ? { color: haciaObjetivo ? Colors.success : Colors.warning } : null]}>
                  {diff == null ? '—' : diff === 0 ? '0 kg' : `${diff < 0 ? '↓' : '↑'} ${Math.abs(diff)} kg`}
                </Text>
                <Text style={s.pesoLbl}>Cambio</Text>
              </View>
              <View style={s.pesoItem}><Text style={s.pesoVal}>{goal ? `${goal.target_weight} kg` : '—'}</Text><Text style={s.pesoLbl}>Objetivo</Text></View>
            </View>
            {logs.length >= 2
              ? <GraficaPeso pesos={logs.map(l => l.weight)} labels={logs.map(l => new Date(l.logged_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' }))} />
              : <Text style={s.empty}>Registra tu peso al menos dos veces para ver la gráfica.</Text>}
          </View>

          <View style={s.card}>
            <Text style={s.cardTit}>Registrar peso de hoy</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <TextInput style={s.inp} value={peso} onChangeText={setPeso} keyboardType="decimal-pad" placeholder="kg" placeholderTextColor={Colors.textLight} returnKeyType="done" onSubmitEditing={guardarPeso} />
              <TouchableOpacity style={s.btn} onPress={guardarPeso} disabled={guardando}>
                {guardando ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.cardTit}>Foto de progreso</Text>
            <View style={s.chips}>
              {TIPOS.map(t => (
                <TouchableOpacity key={t.v} style={[s.chip, tipo === t.v && s.chipOn]} onPress={() => setTipo(t.v)}>
                  <Text style={[s.chipTxt, tipo === t.v && { color: '#fff' }]}>{t.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {subiendo ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.md }} /> : (
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <TouchableOpacity style={[s.btn, s.btnOutline, { flex: 1 }]} onPress={() => subirFoto('camara')}>
                  <Ionicons name="camera-outline" size={18} color={Colors.primary} /><Text style={s.btnOutlineTxt}>Cámara</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btn, s.btnOutline, { flex: 1 }]} onPress={() => subirFoto('galeria')}>
                  <Ionicons name="images-outline" size={18} color={Colors.primary} /><Text style={s.btnOutlineTxt}>Galería</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={s.privacy}>🔒 Tus fotos son privadas: solo las ve Chris.</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, padding: Spacing.md },
  hdr: { padding: Spacing.md, paddingBottom: 0 },
  tit: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  cardTit: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },
  pesoRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.sm },
  pesoItem: { alignItems: 'center' },
  pesoVal: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  pesoLbl: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  empty: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
  inp: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, minHeight: 48 },
  btnTxt: { color: '#fff', fontWeight: '600' },
  btnOutline: { backgroundColor: Colors.primaryLight },
  btnOutlineTxt: { color: Colors.primary, fontWeight: '600' },
  chips: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  chipOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  privacy: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center' },
});
