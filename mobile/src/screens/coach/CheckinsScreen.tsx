import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import * as api from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { Empty, ErrorState, Loading, refresher } from '../../components/ui';
import CheckinCard from '../../components/CheckinCard';

export default function CheckinsScreen() {
  const { data, error, loading, refreshing, refresh, reload } = useAsync(() => api.fetchRecentResponses(), []);
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.hdr}><Text style={s.tit}>Check-ins</Text><Text style={s.sub}>Últimas respuestas de tus clientes</Text></View>
      {loading ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={reload} /> : (
        <FlatList
          style={{ flex: 1, paddingHorizontal: Spacing.md }}
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
          data={data ?? []}
          keyExtractor={r => r.id}
          refreshControl={refresher(refreshing, refresh)}
          ListEmptyComponent={<Empty icon="clipboard-outline" title="Aún no hay respuestas" />}
          renderItem={({ item }) => <CheckinCard r={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  hdr: { padding: Spacing.md },
  tit: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  sub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});
