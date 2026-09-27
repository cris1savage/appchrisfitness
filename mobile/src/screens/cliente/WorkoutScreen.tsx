import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { useClientId } from '../../context/AuthContext';
import * as api from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { Empty, ErrorState, Loading, refresher } from '../../components/ui';
import { openLink } from '../../utils/openLink';

type SerieHecha = { teId: string; serie: number; peso: number; reps: number };

/** Acepta "72,5" o "72.5" (teclado español) y devuelve número válido o null */
const parseNum = (v: string) => { const n = Number(v.replace(',', '.')); return v.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : null; };
const descanso = (sec: number | null) => (sec == null ? null : sec >= 60 ? `${+(sec / 60).toFixed(1)} min` : `${sec} s`);

export default function WorkoutScreen() {
  const clientId = useClientId();
  const { data, error, loading, refreshing, refresh, reload, setData } = useAsync(async () => {
    const [block, logs] = await Promise.all([api.fetchActiveBlock(clientId), api.fetchMyLogs(clientId)]);
    return { block, logs };
  }, [clientId]);

  const [dia, setDia] = useState<api.TrainingDay | null>(null);
  const [ejIdx, setEjIdx] = useState(0);
  const [serieIdx, setSerieIdx] = useState(0);
  const [completados, setCompletados] = useState<SerieHecha[]>([]);
  const [modal, setModal] = useState(false);
  const [peso, setPeso] = useState('');
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState('');
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);

  const iniciar = (d: api.TrainingDay) => {
    if (!d.exercises.length) { Alert.alert('Día sin ejercicios', 'Chris aún no ha añadido ejercicios a este día.'); return; }
    setDia(d); setEjIdx(0); setSerieIdx(0); setCompletados([]);
  };

  const salir = () => {
    if (!completados.length) { setDia(null); return; }
    // Las series ya están guardadas en la base de datos, salir no las borra
    Alert.alert('¿Terminar el entreno?', 'Las series registradas ya están guardadas.', [
      { text: 'Seguir', style: 'cancel' },
      { text: 'Terminar', onPress: () => setDia(null) },
    ]);
  };

  const ultimoLog = (teId: string) => data?.logs.find(l => l.training_exercise_id === teId);

  const abrirRegistro = () => {
    const te = dia!.exercises[ejIdx];
    const last = ultimoLog(te.id);
    setPeso(last?.weight != null ? String(last.weight) : '');
    setReps(''); setRir(''); setNota('');
    setModal(true);
  };

  const registrar = async () => {
    if (!dia || guardando) return;
    const te = dia.exercises[ejIdx];
    const p = parseNum(peso), r = parseNum(reps);
    if (p === null || r === null) { Alert.alert('Datos incompletos', 'Introduce el peso y las repeticiones.'); return; }
    const rirN = rir.trim() ? parseNum(rir) : null;
    setGuardando(true);
    try {
      await api.logSet({ clientId, trainingExerciseId: te.id, weight: p, reps: r, rir: rirN, note: nota });
    } catch (e) {
      setGuardando(false);
      Alert.alert('No se ha guardado', e instanceof Error ? e.message : 'Revisa tu conexión e inténtalo de nuevo.');
      return;
    }
    setGuardando(false);
    setModal(false);
    setCompletados(c => [...c, { teId: te.id, serie: serieIdx, peso: p, reps: r }]);
    // Actualiza "última vez" sin recargar
    setData(d => d ? { ...d, logs: [{ training_exercise_id: te.id, logged_at: new Date().toISOString(), weight: p, reps: r }, ...d.logs] } : d);

    const totalSeries = Math.max(te.sets ?? 1, 1);
    if (serieIdx < totalSeries - 1) setSerieIdx(serieIdx + 1);
    else if (ejIdx < dia.exercises.length - 1) { setEjIdx(ejIdx + 1); setSerieIdx(0); }
    else { Alert.alert('¡Entreno completado!', 'Buen trabajo 💪'); setDia(null); }
  };

  if (dia) {
    const te = dia.exercises[ejIdx];
    const totalSeries = Math.max(te.sets ?? 1, 1);
    const last = ultimoLog(te.id);
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.sesHdr}>
          <TouchableOpacity onPress={salir} hitSlop={12}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
          <Text style={s.sesTit} numberOfLines={1}>Día {dia.day_number}{dia.name ? ` · ${dia.name}` : ''}</Text>
          <Text style={s.sesProg}>{ejIdx + 1}/{dia.exercises.length}</Text>
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
          <View style={s.ejCard}>
            <Text style={s.ejNom}>{te.exercise?.name ?? 'Ejercicio'}</Text>
            <Text style={s.ejDet}>
              {[te.reps && `${te.reps} reps`, te.rir != null && `RIR ${te.rir}`, descanso(te.rest_seconds) && `${descanso(te.rest_seconds)} descanso`, te.tempo && `tempo ${te.tempo}`].filter(Boolean).join(' · ')}
            </Text>
            {te.trainer_notes ? <Text style={s.notes}>💬 {te.trainer_notes}</Text> : null}
            {last ? <Text style={s.last}>Última vez: {last.weight ?? '—'} kg × {last.reps ?? '—'}</Text> : null}
            {te.exercise?.video_url ? (
              <TouchableOpacity style={s.vidBtn} onPress={() => openLink(te.exercise?.video_url)}>
                <Ionicons name="play-circle" size={20} color={Colors.primary} />
                <Text style={s.vidTxt}>Ver vídeo de técnica</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={s.seriesTit}>Series</Text>
          {Array.from({ length: totalSeries }, (_, i) => {
            const done = completados.find(c => c.teId === te.id && c.serie === i);
            const current = i === serieIdx;
            return (
              <TouchableOpacity key={i} style={[s.serieRow, current && s.serieRowActive, done && s.serieRowDone]} disabled={!current} onPress={abrirRegistro}>
                <View style={[s.serieNum, done && { backgroundColor: Colors.success }]}>
                  {done ? <Ionicons name="checkmark" size={14} color="#fff" /> : <Text style={s.serieNumTxt}>{i + 1}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.serieLbl}>Serie {i + 1}{te.reps ? ` · ${te.reps} reps` : ''}</Text>
                  {done ? <Text style={s.serieRes}>{done.peso} kg · {done.reps} reps</Text> : null}
                </View>
                {current ? <Text style={s.serieReg}>Registrar</Text> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
          <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={s.modalBox}>
              <Text style={s.modalTit}>Serie {serieIdx + 1} — {te.exercise?.name}</Text>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.modalLbl}>Peso (kg)</Text>
                  <TextInput style={s.modalInp} value={peso} onChangeText={setPeso} keyboardType="decimal-pad" placeholder="0" autoFocus placeholderTextColor={Colors.textLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.modalLbl}>Reps</Text>
                  <TextInput style={s.modalInp} value={reps} onChangeText={setReps} keyboardType="number-pad" placeholder={te.reps ?? '0'} placeholderTextColor={Colors.textLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.modalLbl}>RIR</Text>
                  <TextInput style={s.modalInp} value={rir} onChangeText={setRir} keyboardType="number-pad" placeholder="—" placeholderTextColor={Colors.textLight} />
                </View>
              </View>
              <TextInput style={s.notaInp} value={nota} onChangeText={setNota} placeholder="Nota (opcional): p. ej. posición del banco" placeholderTextColor={Colors.textLight} />
              <View style={s.modalBtns}>
                <TouchableOpacity style={s.modalCancel} onPress={() => setModal(false)}><Text style={{ color: Colors.text }}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={s.modalConfirm} onPress={registrar} disabled={guardando}>
                  {guardando ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Guardar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.hdr}><Text style={s.tit}>{data?.block?.name ?? 'Entrenamiento'}</Text></View>
      {loading ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={reload} /> : (
        <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: Spacing.xl }} refreshControl={refresher(refreshing, refresh)}>
          {!data?.block ? (
            <Empty icon="barbell-outline" title="Sin bloque activo" subtitle="Cuando Chris te asigne un entrenamiento aparecerá aquí." />
          ) : data.block.days.map(d => (
            <View key={d.id} style={s.rutCard}>
              <View style={s.rutBar} />
              <View style={{ flex: 1 }}>
                <Text style={s.rutNom}>Día {d.day_number}{d.name ? ` · ${d.name}` : ''}</Text>
                <Text style={s.rutDesc} numberOfLines={2}>{d.exercises.map(e => e.exercise?.name).filter(Boolean).join(' · ') || 'Sin ejercicios'}</Text>
                <Text style={s.rutEjs}>{d.exercises.length} ejercicios</Text>
              </View>
              <TouchableOpacity style={s.btnIni} onPress={() => iniciar(d)}>
                <Text style={s.btnIniTxt}>Iniciar</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  rutCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, ...Shadow.sm },
  rutBar: { width: 6, height: 52, borderRadius: 3, backgroundColor: Colors.primary },
  rutNom: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  rutDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  rutEjs: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 2 },
  btnIni: { borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.primary },
  btnIniTxt: { color: '#fff', fontWeight: '600', fontSize: FontSize.sm },
  sesHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sesTit: { flex: 1, fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  sesProg: { fontSize: FontSize.sm, color: Colors.textSecondary },
  ejCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  ejNom: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  ejDet: { fontSize: FontSize.sm, color: Colors.textSecondary },
  notes: { fontSize: FontSize.sm, color: Colors.text, marginTop: Spacing.sm, fontStyle: 'italic' },
  last: { fontSize: FontSize.sm, color: Colors.primary, marginTop: Spacing.sm, fontWeight: '600' },
  vidBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  vidTxt: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500' },
  seriesTit: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  serieRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.card, marginBottom: 8, borderRadius: Radius.md, padding: Spacing.md },
  serieRowActive: { borderWidth: 2, borderColor: Colors.primary },
  serieRowDone: { opacity: 0.6 },
  serieNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  serieNumTxt: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  serieLbl: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text },
  serieRes: { fontSize: FontSize.xs, color: Colors.success, marginTop: 2 },
  serieReg: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, paddingBottom: Spacing.xl },
  modalTit: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  modalLbl: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.sm },
  modalInp: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.xl, fontWeight: '700', textAlign: 'center', borderWidth: 1, borderColor: Colors.border, color: Colors.text },
  notaInp: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.sm, borderWidth: 1, borderColor: Colors.border, color: Colors.text, marginTop: Spacing.md },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  modalCancel: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.background, alignItems: 'center' },
  modalConfirm: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center' },
});
