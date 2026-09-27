import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing, Shadow } from '../constants/theme';
import type { CheckinResponse } from '../lib/api';

export default function CheckinCard({ r, showClient = true }: { r: CheckinResponse; showClient?: boolean }) {
  return (
    <View style={s.card}>
      <View style={s.head}>
        <Text style={s.tit} numberOfLines={1}>{showClient ? r.clientName : r.templateName}</Text>
        <Text style={s.date}>{new Date(r.submitted_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</Text>
      </View>
      {showClient ? <Text style={s.tpl}>{r.templateName}</Text> : null}
      {Object.entries(r.answers).map(([q, a]) => (
        <Text key={q} style={s.qa}><Text style={s.q}>{q}: </Text>{String(a) || '—'}</Text>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  tit: { flex: 1, fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  date: { fontSize: FontSize.xs, color: Colors.textSecondary },
  tpl: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2, marginBottom: 4 },
  qa: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  q: { color: Colors.text, fontWeight: '600' },
});
