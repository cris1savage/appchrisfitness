'use server';

import { getMyClientId } from '@/lib/getMyClientId';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function logExercise(trainingExerciseId: string, clientId: string, formData: FormData) {
  // No fiarse del clientId que llega del navegador: debe ser el del usuario con sesión
  if ((await getMyClientId()) !== clientId) return { error: 'No autorizado.' };

  const supabase = await createClient();

  const weight = Number(formData.get('weight') ?? 0) || null;
  const reps = Number(formData.get('reps') ?? 0) || null;
  const rir = formData.get('rir') ? Number(formData.get('rir')) : null;
  const client_note = String(formData.get('client_note') ?? '').trim() || null;

  const { error } = await supabase.from('exercise_logs').insert({
    training_exercise_id: trainingExerciseId,
    client_id: clientId,
    weight,
    reps,
    rir,
    client_note,
  });

  if (error) return { error: error.message };

  revalidatePath('/mi-entrenamiento');
  return { success: true };
}
