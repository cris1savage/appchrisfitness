import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing, Shadow } from '../constants/theme';

export function Loading() {
  return <View style={s.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={s.center}>
      <Ionicons name="cloud-offline-outline" size={40} color={Colors.textLight} />
      <Text style={s.tit}>No se pudieron cargar los datos</Text>
      <Text style={s.sub}>{message}</Text>
      <TouchableOpacity style={s.btn} onPress={onRetry}><Text style={s.btnTxt}>Reintentar</Text></TouchableOpacity>
    </View>
  );
}

export function Empty({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string }) {
  return (
    <View style={s.empty}>
      <Ionicons name={icon} size={44} color={Colors.textLight} />
      <Text style={s.tit}>{title}</Text>
      {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
    </View>
  );
}

export function refresher(refreshing: boolean, onRefresh: () => void) {
  return <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />;
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>;
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  empty: { alignItems: 'center', padding: Spacing.xxl },
  tit: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginTop: Spacing.md, textAlign: 'center' },
  sub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginTop: Spacing.lg },
  btnTxt: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
});
