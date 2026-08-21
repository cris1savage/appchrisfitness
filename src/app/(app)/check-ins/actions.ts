'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CheckinQuestion = { id: string; label: string; type: 'text' | 'number' | 'photo' };

export async function createTemplate(formData: FormData) {
  const supabase = createClient();

  const name = String(formData.get('name') ?? '').trim();
  const questionsRaw = String(formData.get('questions') ?? '').trim();

  if (!name || !questionsRaw) return { error: 'Ponle nombre y al menos una pregunta.' };

  // una pregunta por línea en el textarea, se convierte a estructura simple
  const questions: CheckinQuestion[] = questionsRaw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((label, i) => ({ id: `q${i + 1}`, label, type: 'text' as const }));

  const { error } = await supabase.from('checkin_templates').insert({ name, questions });

  if (error) return { error: error.message };

  revalidatePath('/check-ins');
  return { success: true };
}

export async function deleteTemplate(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('checkin_templates').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/check-ins');
  return { success: true };
}

export async function scheduleCheckin(formData: FormData) {
  const supabase = createClient();

  const client_id = String(formData.get('client_id') ?? '');
  const template_id = String(formData.get('template_id') ?? '');
  const day_of_week = Number(formData.get('day_of_week') ?? 0);

  if (!client_id || !template_id) return { error: 'Elige cliente y plantilla.' };

  const { error } = await supabase.from('checkin_schedule').insert({
    client_id,
    template_id,
    day_of_week,
  });

  if (error) return { error: error.message };

  revalidatePath('/check-ins');
  return { success: true };
}

export async function removeSchedule(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('checkin_schedule').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/check-ins');
  return { success: true };
}
