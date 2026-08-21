'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createBlock(clientId: string, formData: FormData) {
  const supabase = createClient();

  const name = String(formData.get('name') ?? '').trim();
  const length_days = Number(formData.get('length_days') ?? 0);
  const start_date = String(formData.get('start_date') ?? '');

  if (!name || !length_days || !start_date) {
    return { error: 'Rellena nombre, duración y fecha de inicio.' };
  }

  const { data: block, error } = await supabase
    .from('training_blocks')
    .insert({ client_id: clientId, name, length_days, start_date })
    .select('id')
    .single();

  if (error || !block) return { error: error?.message ?? 'No se pudo crear el bloque.' };

  // crea automáticamente los N días vacíos del bloque
  const days = Array.from({ length: length_days }, (_, i) => ({
    block_id: block.id,
    day_number: i + 1,
  }));
  await supabase.from('training_days').insert(days);

  revalidatePath(`/entrenamiento/${clientId}`);
  return { success: true, blockId: block.id };
}

export async function renameDay(dayId: string, clientId: string, name: string) {
  const supabase = createClient();
  const { error } = await supabase.from('training_days').update({ name }).eq('id', dayId);
  if (error) return { error: error.message };
  revalidatePath(`/entrenamiento/${clientId}`);
  return { success: true };
}

export async function addExerciseToDay(dayId: string, clientId: string, formData: FormData) {
  const supabase = createClient();

  const exercise_id = String(formData.get('exercise_id') ?? '');
  const sets = Number(formData.get('sets') ?? 0) || null;
  const reps = String(formData.get('reps') ?? '').trim() || null;
  const rir = formData.get('rir') ? Number(formData.get('rir')) : null;
  const rest_seconds = formData.get('rest_seconds') ? Number(formData.get('rest_seconds')) : null;
  const trainer_notes = String(formData.get('trainer_notes') ?? '').trim() || null;

  if (!exercise_id) return { error: 'Elige un ejercicio.' };

  const { data: existing } = await supabase
    .from('training_exercises')
    .select('id')
    .eq('training_day_id', dayId);

  const { error } = await supabase.from('training_exercises').insert({
    training_day_id: dayId,
    exercise_id,
    order_index: existing?.length ?? 0,
    sets,
    reps,
    rir,
    rest_seconds,
    trainer_notes,
  });

  if (error) return { error: error.message };

  revalidatePath(`/entrenamiento/${clientId}`);
  return { success: true };
}

export async function removeTrainingExercise(id: string, clientId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('training_exercises').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/entrenamiento/${clientId}`);
  return { success: true };
}
