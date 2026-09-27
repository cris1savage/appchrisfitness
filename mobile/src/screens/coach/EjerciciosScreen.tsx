import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import * as api from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { Empty, ErrorState, Loading, refresher } from '../../components/ui';
import { openLink } from '../../utils/openLink';

/** Minúsculas sin tildes: "jalon" encuentra "JALÓN" */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function EjerciciosScreen() {
  const { data, error, loading, refreshing, refresh, reload } = useAsync(api.fetchExercises, []);
  const [busq, setBusq] = useState('');

  const filtered = useMemo(() => {
    const q = norm(busq.trim());
    return (data ?? []).filter(e => norm(e.name).includes(q));
  }, [data, busq]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.hdr}>
        <Text style={s.tit}>Ejercicios</Text>
        <Text style={s.count}>{data ? filtered.length : ''}</Text>
      </View>
      <View style={s.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textLight} />
        <TextInput style={s.searchInp} placeholder="Buscar ejercicio..." value={busq} onChangeText={setBusq} autoCorrect={false} clearButtonMode="while-editing" placeholderTextColor={Colors.textLight} />
      </View>
      {loading ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={reload} /> : (
        <FlatList
          style={s.list}
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
          data={filtered}
          keyExtractor={e => e.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={refresher(refreshing, refresh)}
          ListEmptyComponent={<Empty icon="barbell-outline" title={data?.length ? 'No hay ejercicios que coincidan' : 'Biblioteca vacía'} subtitle={data?.length ? undefined : 'Añade ejercicios desde el panel web.'} />}
          renderItem={({ item: e }) => (
            <TouchableOpacity style={s.ejCard} disabled={!e.video_url} onPress={() => openLink(e.video_url)}>
              <View style={s.ejThumb}><Text style={s.ejThumbTxt}>{e.video_url ? '▶' : 'CF'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.ejNom}>{e.name}</Text>
                {e.description ? <Text style={s.ejDesc} numberOfLines={2}>{e.description}</Text> : null}
              </View>
              {e.video_url ? <Ionicons name="play-circle-outline" size={26} color={Colors.primary} /> : null}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { flex: 1, paddingHorizontal: Spacing.md },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  tit: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  count: { fontSize: FontSize.sm, color: Colors.textSecondary },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.card, marginHorizontal: Spacing.md, marginBottom: Spacing.md, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  searchInp: { flex: 1, fontSize: FontSize.md, color: Colors.text, paddingVertical: 4 },
  ejCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 8, ...Shadow.sm },
  ejThumb: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  ejThumbTxt: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  ejNom: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  ejDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
