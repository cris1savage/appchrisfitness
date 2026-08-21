'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function chooseOption(optionId: string, mealId: string) {
  const supabase = createClient();

  await supabase.from('meal_options').update({ is_selected: false }).eq('meal_id', mealId);
  const { error } = await supabase.from('meal_options').update({ is_selected: true }).eq('id', optionId);

  if (error) return { error: error.message };

  revalidatePath('/mi-nutricion');
  return { success: true };
}
