import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import * as api from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { Empty, ErrorState, Loading, refresher } from '../../components/ui';
import CheckinCard from '../../components/CheckinCard';
import GraficaPeso from '../../components/WeightChart';
import { openLink } from '../../utils/openLink';
import { WEB_URL } from '../../config';

function DetalleCliente({ cliente, onClose }: { cliente: api.ClientSummary; onClose: () => void }) {
  const { data, loading, error, reload } = useAsync(async () => {
    const [progress, responses] = await Promise.all([api.fetchProgress(cliente.id), api.fetchRecentResponses(cliente.id)]);
    return { progress, responses };
  }, [cliente.id]);
  const logs = data?.progress.logs ?? [];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.detHdr}>
        <TouchableOpacity onPress={onClose} hitSlop={12}><Ionicons name="chevron-down" size={26} color={Colors.text} /></TouchableOpacity>
        <Text style={s.detTit} numberOfLines={1}>{cliente.full_name}</Text>
        <View style={{ width: 26 }} />
      </View>
      {loading ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={reload} /> : (
        <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
          <View style={s.card}>
            <Text style={s.cardTit}>Peso</Text>
            {logs.length >= 2
              ? <GraficaPeso pesos={logs.map(l => l.weight)} labels={logs.map(l => new Date(l.logged_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' }))} />
              : <Text style={s.muted}>{logs.length ? `Último: ${logs[0].weight} kg` : 'Sin registros de peso'}</Text>}
            {data?.progress.goal ? <Text style={[s.muted, { marginTop: Spacing.sm }]}>Objetivo: {data.progress.goal.start_weight} → {data.progress.goal.target_weight} kg</Text> : null}
          </View>
          <Text style={s.section}>Últimos check-ins</Text>
          {data?.responses.length ? data.responses.map(r => <CheckinCard key={r.id} r={r} showClient={false} />) : <Text style={s.muted}>Todavía no ha enviado ninguno.</Text>}
          {WEB_URL ? (
            <TouchableOpacity style={s.webBtn} onPress={() => openLink(`${WEB_URL}/clientes/${cliente.id}/progreso`)}>
              <Ionicons name="open-outline" size={16} color={Colors.primary} />
              <Text style={s.webBtnTxt}>Ver fotos y editar plan en el panel web</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default function ClientesScreen() {
  const { user, logout } = useAuth();
  const { data, error, loading, refreshing, refresh, reload } = useAsync(api.fetchClients, []);
  const [sel, setSel] = useState<api.ClientSummary | null>(null);
  const [busq, setBusq] = useState('');
  const filtrados = (data ?? []).filter(c => c.full_name.toLowerCase().includes(busq.trim().toLowerCase()));

  const salir = () => Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Salir', style: 'destructive', onPress: () => { void logout(); } },
  ]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.hdr}>
        <View style={{ flex: 1 }}>
          <Text style={s.tit}>Hola, {user?.nombre?.split(' ')[0]} 👋</Text>
          <Text style={s.sub}>{data ? `${data.length} clientes` : ' '}</Text>
        </View>
        <TouchableOpacity onPress={salir} hitSlop={10}><Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} /></TouchableOpacity>
      </View>
      <View style={s.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textLight} />
        <TextInput style={s.searchInp} placeholder="Buscar cliente..." value={busq} onChangeText={setBusq} placeholderTextColor={Colors.textLight} autoCorrect={false} />
      </View>
      {loading ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={reload} /> : (
        <FlatList
          style={s.scroll}
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
          data={filtrados}
          keyExtractor={c => c.id}
          refreshControl={refresher(refreshing, refresh)}
          ListEmptyComponent={<Empty icon="people-outline" title="Sin clientes" subtitle="Da de alta clientes desde el panel web." />}
          ListFooterComponent={WEB_URL ? <Text style={s.foot}>Para crear rutinas, planes y clientes usa el panel web desde el ordenador.</Text> : null}
          renderItem={({ item: c }) => (
            <TouchableOpacity style={s.cliRow} onPress={() => setSel(c)}>
              <View style={s.cliAv}><Text style={s.cliAvTxt}>{c.full_name.charAt(0)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.cliNom}>{c.full_name}</Text>
                <Text style={s.cliSub} numberOfLines={1}>{[c.goal, c.status].filter(Boolean).join(' · ') || c.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        />
      )}
      <Modal visible={!!sel} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSel(null)}>
        {sel ? <DetalleCliente cliente={sel} onClose={() => setSel(null)} /> : null}
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, paddingHorizontal: Spacing.md },
  hdr: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  tit: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  sub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.card, marginHorizontal: Spacing.md, marginBottom: Spacing.md, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  searchInp: { flex: 1, fontSize: FontSize.md, color: Colors.text, paddingVertical: 4 },
  cliRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 8, ...Shadow.sm },
  cliAv: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cliAvTxt: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  cliNom: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  cliSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  foot: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md },
  detHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detTit: { flex: 1, textAlign: 'center', fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginVertical: Spacing.md, ...Shadow.sm },
  cardTit: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  section: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  muted: { fontSize: FontSize.sm, color: Colors.textSecondary },
  webBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: Spacing.lg, padding: Spacing.md },
  webBtnTxt: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm },
});
