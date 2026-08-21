'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createFood(formData: FormData) {
  const supabase = createClient();

  const name = String(formData.get('name') ?? '').trim();
  const kcal_per_100 = Number(formData.get('kcal_per_100') ?? 0);
  const protein_per_100 = Number(formData.get('protein_per_100') ?? 0);
  const carbs_per_100 = Number(formData.get('carbs_per_100') ?? 0);
  const fat_per_100 = Number(formData.get('fat_per_100') ?? 0);
  const fiber_per_100 = Number(formData.get('fiber_per_100') ?? 0);

  if (!name) return { error: 'El nombre es obligatorio.' };

  const { error } = await supabase.from('foods_library').insert({
    name,
    kcal_per_100,
    protein_per_100,
    carbs_per_100,
    fat_per_100,
    fiber_per_100,
  });

  if (error) return { error: error.message };

  revalidatePath('/alimentos');
  return { success: true };
}

export async function deleteFood(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('foods_library').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/alimentos');
  return { success: true };
}
