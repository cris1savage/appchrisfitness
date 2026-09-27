'use server';

import { assertAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createExercise(formData: FormData) {
  const denied = await assertAdmin();
  if (denied) return { error: denied.error };

  const supabase = await createClient();

  const name = String(formData.get('name') ?? '').trim();
  const video_url = String(formData.get('video_url') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const technique_notes = String(formData.get('technique_notes') ?? '').trim();
  const common_mistakes = String(formData.get('common_mistakes') ?? '').trim();

  if (!name) return { error: 'El nombre es obligatorio.' };

  const { error } = await supabase.from('exercises_library').insert({
    name,
    video_url: video_url || null,
    description: description || null,
    technique_notes: technique_notes || null,
    common_mistakes: common_mistakes || null,
  });

  if (error) return { error: error.message };

  revalidatePath('/ejercicios');
  return { success: true };
}

export async function deleteExercise(id: string) {
  const denied = await assertAdmin();
  if (denied) return { error: denied.error };

  const supabase = await createClient();
  const { error } = await supabase.from('exercises_library').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/ejercicios');
  return { success: true };
}
