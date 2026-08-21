'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function setWeightGoal(clientId: string, formData: FormData) {
  const supabase = createClient();

  const start_weight = Number(formData.get('start_weight') ?? 0);
  const target_weight = Number(formData.get('target_weight') ?? 0);
  const start_date = String(formData.get('start_date') ?? '');
  const target_date = String(formData.get('target_date') ?? '');
  const weekly_rate = Number(formData.get('weekly_rate') ?? 0) || null;

  if (!start_weight || !target_weight || !start_date || !target_date) {
    return { error: 'Rellena peso inicial, objetivo y fechas.' };
  }

  // desactiva objetivos anteriores
  await supabase.from('weight_goals').update({ is_active: false }).eq('client_id', clientId).eq('is_active', true);

  const { error } = await supabase.from('weight_goals').insert({
    client_id: clientId,
    start_weight,
    target_weight,
    start_date,
    target_date,
    weekly_rate,
  });

  if (error) return { error: error.message };

  revalidatePath(`/clientes/${clientId}/progreso`);
  return { success: true };
}

export async function logWeight(clientId: string, formData: FormData) {
  const supabase = createClient();

  const weight = Number(formData.get('weight') ?? 0);
  const logged_at = String(formData.get('logged_at') ?? new Date().toISOString().slice(0, 10));

  if (!weight) return { error: 'Introduce un peso válido.' };

  const { error } = await supabase.from('weight_logs').insert({ client_id: clientId, weight, logged_at });

  if (error) return { error: error.message };

  revalidatePath(`/clientes/${clientId}/progreso`);
  return { success: true };
}
