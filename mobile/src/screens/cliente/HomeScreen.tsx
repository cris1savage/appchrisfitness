import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth, useClientId } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import * as api from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { ErrorState, Loading, refresher } from '../../components/ui';
import { DIAS_DOMINGO_PRIMERO } from '../../utils/dates';
import type { ClienteTabsParams } from '../../navigation/MainNavigator';

export default function HomeScreen() {
  const { user } = useAuth();
  const clientId = useClientId();
  const navigation = useNavigation<BottomTabNavigationProp<ClienteTabsParams>>();
  const { data, error, loading, refreshing, refresh, reload } = useAsync(async () => {
    const [block, checkins, progress] = await Promise.all([
      api.fetchActiveBlock(clientId), api.fetchMyCheckins(clientId), api.fetchProgress(clientId),
    ]);
    return { block, checkins, progress };
  }, [clientId]);

  const hoy = new Date().getDay(); // 0 = domingo, igual que day_of_week en la base de datos
  const checkinHoy = data?.checkins.find(c => c.day_of_week === hoy);
  const proximo = data?.checkins.slice().sort((a, b) => ((a.day_of_week - hoy + 7) % 7) - ((b.day_of_week - hoy + 7) % 7))[0];
  const ultimoPeso = data?.progress.logs.at(-1);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: Spacing.xl, flexGrow: 1 }} refreshControl={refresher(refreshing, refresh)}>
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>Hola, {user?.nombre?.split(' ')[0]} 👋</Text>
            <Text style={s.date}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <View style={s.av}><Text style={s.avTxt}>{user?.nombre?.charAt(0)}</Text></View>
        </View>

        {loading ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={reload} /> : data ? (
          <>
            <View style={s.card}>
              <Text style={s.cardLbl}>TU ENTRENAMIENTO</Text>
              {data.block ? (
                <>
                  <Text style={s.blockName}>{data.block.name}</Text>
                  <Text style={s.desc}>{data.block.days.length} días · {data.block.days.reduce((n, d) => n + d.exercises.length, 0)} ejercicios</Text>
                  <TouchableOpacity style={s.btnStart} onPress={() => navigation.navigate('Entreno')}>
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={s.btnStartTxt}>Ir a entrenar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={s.desc}>Chris aún no te ha asignado un bloque de entrenamiento.</Text>
              )}
            </View>

            {data.checkins.length > 0 && (
              <TouchableOpacity style={[s.row, checkinHoy && s.rowHighlight]} onPress={() => navigation.navigate('Perfil', { abrirCheckin: true, ts: Date.now() })}>
                <Ionicons name="clipboard-outline" size={24} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTit}>{checkinHoy ? '¡Hoy toca check-in!' : 'Check-in semanal'}</Text>
                  <Text style={s.rowSub}>
                    {checkinHoy ? checkinHoy.template?.name : proximo ? `Próximo: ${DIAS_DOMINGO_PRIMERO[proximo.day_of_week].toLowerCase()}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Progreso')}>
              <Ionicons name="scale-outline" size={24} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowTit}>{ultimoPeso ? `${ultimoPeso.weight} kg` : 'Registra tu peso'}</Text>
                <Text style={s.rowSub}>
                  {ultimoPeso ? `Último registro: ${new Date(ultimoPeso.logged_at).toLocaleDateString('es-ES')}` : 'Aún no hay registros'}
                  {data.progress.goal ? ` · Objetivo ${data.progress.goal.target_weight} kg` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, padding: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  date: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  av: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avTxt: { color: '#fff', fontSize: FontSize.lg, fontWeight: '700' },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.md },
  cardLbl: { fontSize: FontSize.xs, color: Colors.textLight, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.sm },
  blockName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  desc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  btnStart: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, padding: Spacing.md, gap: 8, backgroundColor: Colors.primary },
  btnStartTxt: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
  row: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  rowHighlight: { borderWidth: 2, borderColor: Colors.primary },
  rowTit: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  rowSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
