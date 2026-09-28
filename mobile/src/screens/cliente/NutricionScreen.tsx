import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { useClientId } from '../../context/AuthContext';
import * as api from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { Empty, ErrorState, Loading, refresher } from '../../components/ui';

export default function NutricionScreen() {
  const clientId = useClientId();
  const { data: plan, setData, error, loading, refreshing, refresh, reload } = useAsync(() => api.fetchActivePlan(clientId), [clientId]);
  const [pendiente, setPendiente] = useState<string | null>(null);

  const elegir = async (meal: api.Meal, option: api.MealOption) => {
    if (option.is_selected || pendiente) return;
    const previo = plan;
    // Cambio optimista: se ve al instante y se deshace si falla
    setData(p => p && { ...p, meals: p.meals.map(m => m.id !== meal.id ? m : { ...m, options: m.options.map(o => ({ ...o, is_selected: o.id === option.id })) }) });
    setPendiente(meal.id);
    try {
      await api.chooseOption(option.id, meal.id);
    } catch (e) {
      setData(previo);
      Alert.alert('No se ha guardado', e instanceof Error ? e.message : 'Revisa tu conexión.');
    } finally {
      setPendiente(null);
    }
  };

  // Totales del día con la opción elegida en cada comida
  const dia = plan?.meals.reduce((acc, m) => {
    const sel = m.options.find(o => o.is_selected) ?? m.options[0];
    if (!sel) return acc;
    const t = api.optionTotals(sel);
    return { kcal: acc.kcal + t.kcal, protein: acc.protein + t.protein, carbs: acc.carbs + t.carbs, fat: acc.fat + t.fat };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  const macros = plan && dia ? [
    { n: 'Proteína', v: dia.protein, obj: plan.target_protein, c: '#f97316' },
    { n: 'Carbos', v: dia.carbs, obj: plan.target_carbs, c: '#22c55e' },
    { n: 'Grasas', v: dia.fat, obj: plan.target_fat, c: '#a855f7' },
  ] : [];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.hdr}><Text style={s.tit}>{plan?.name ?? 'Nutrición'}</Text></View>
      {loading ? <Loading /> : error && !plan ? <ErrorState message={error} onRetry={reload} /> : (
        <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: Spacing.xl }} refreshControl={refresher(refreshing, refresh)}>
          {!plan ? (
            <Empty icon="nutrition-outline" title="Sin plan de nutrición" subtitle="Cuando Chris te asigne un plan aparecerá aquí." />
          ) : (
            <>
              <View style={s.macroCard}>
                <View style={s.kcalCircle}>
                  <Text style={s.kcalNum}>{Math.round(dia!.kcal)}</Text>
                  <Text style={s.kcalLbl}>{plan.target_kcal ? `de ${plan.target_kcal}` : 'kcal'}</Text>
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  {macros.map(m => (
                    <View key={m.n}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={{ fontSize: FontSize.xs, color: Colors.textSecondary }}>{m.n}</Text>
                        <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: m.c }}>{Math.round(m.v)}{m.obj ? ` / ${m.obj}` : ''} g</Text>
                      </View>
                      <View style={s.mBar}><View style={[s.mFill, { width: `${Math.min(m.obj ? (m.v / m.obj) * 100 : 0, 100)}%`, backgroundColor: m.c }]} /></View>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={s.hint}>Toca una opción para elegir qué vas a comer. Chris lo verá en su panel.</Text>
              {plan.meals.map(meal => (
                <View key={meal.id} style={s.comidaCard}>
                  <Text style={s.comidaNom}>{meal.name}</Text>
                  {meal.options.length === 0 ? <Text style={s.opTxt}>Sin opciones todavía</Text> : null}
                  {meal.options.map(opt => {
                    const t = api.optionTotals(opt);
                    const activa = opt.is_selected || (!meal.options.some(o => o.is_selected) && opt === meal.options[0]);
                    return (
                      <TouchableOpacity key={opt.id} style={[s.opt, activa && s.optOn]} onPress={() => elegir(meal, opt)} disabled={pendiente === meal.id}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[s.optTit, activa && { color: Colors.primary }]}>
                            Opción {opt.option_number} {activa ? <Ionicons name="checkmark-circle" size={14} color={Colors.primary} /> : null}
                          </Text>
                          <Text style={s.optKcal}>{Math.round(t.kcal)} kcal</Text>
                        </View>
                        <Text style={s.opTxt}>{opt.foods.map(f => `${f.quantity_grams} g ${f.food?.name ?? ''}`).join(' · ') || 'Sin alimentos'}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </>
          )}
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
  macroCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  kcalCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  kcalNum: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  kcalLbl: { fontSize: 10, color: Colors.textSecondary },
  mBar: { height: 4, backgroundColor: Colors.background, borderRadius: 2, overflow: 'hidden' },
  mFill: { height: 4, borderRadius: 2 },
  hint: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.md, textAlign: 'center' },
  comidaCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  comidaNom: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  opt: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: 6, backgroundColor: Colors.background },
  optOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optTit: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  optKcal: { fontSize: FontSize.xs, color: Colors.textSecondary },
  opTxt: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
});
