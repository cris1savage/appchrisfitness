'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPlan(clientId: string, formData: FormData) {
  const supabase = createClient();

  const name = String(formData.get('name') ?? '').trim();
  const target_kcal = Number(formData.get('target_kcal') ?? 0) || null;
  const target_protein = Number(formData.get('target_protein') ?? 0) || null;
  const target_carbs = Number(formData.get('target_carbs') ?? 0) || null;
  const target_fat = Number(formData.get('target_fat') ?? 0) || null;

  if (!name) return { error: 'El nombre del plan es obligatorio.' };

  const { error } = await supabase.from('nutrition_plans').insert({
    client_id: clientId,
    name,
    target_kcal,
    target_protein,
    target_carbs,
    target_fat,
  });

  if (error) return { error: error.message };

  revalidatePath(`/nutricion/${clientId}`);
  return { success: true };
}

export async function addMeal(planId: string, clientId: string, formData: FormData) {
  const supabase = createClient();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Ponle nombre a la comida.' };

  const { data: existing } = await supabase.from('meals').select('id').eq('plan_id', planId);

  const { error } = await supabase.from('meals').insert({
    plan_id: planId,
    name,
    order_index: existing?.length ?? 0,
  });

  if (error) return { error: error.message };
  revalidatePath(`/nutricion/${clientId}`);
  return { success: true };
}

export async function addOption(mealId: string, clientId: string) {
  const supabase = createClient();

  const { data: existing } = await supabase.from('meal_options').select('option_number').eq('meal_id', mealId);
  const nextNumber = (existing?.length ?? 0) + 1;
  const isFirst = nextNumber === 1;

  const { error } = await supabase.from('meal_options').insert({
    meal_id: mealId,
    option_number: nextNumber,
    is_selected: isFirst, // la primera opción queda seleccionada por defecto
  });

  if (error) return { error: error.message };
  revalidatePath(`/nutricion/${clientId}`);
  return { success: true };
}

export async function selectOption(optionId: string, mealId: string, clientId: string) {
  const supabase = createClient();

  // desmarca las demás opciones de esa comida, marca solo esta
  await supabase.from('meal_options').update({ is_selected: false }).eq('meal_id', mealId);
  const { error } = await supabase.from('meal_options').update({ is_selected: true }).eq('id', optionId);

  if (error) return { error: error.message };
  revalidatePath(`/nutricion/${clientId}`);
  return { success: true };
}

export async function addFoodToOption(optionId: string, clientId: string, formData: FormData) {
  const supabase = createClient();

  const food_id = String(formData.get('food_id') ?? '');
  const quantity_grams = Number(formData.get('quantity_grams') ?? 0);

  if (!food_id || !quantity_grams) return { error: 'Elige alimento y cantidad.' };

  const { error } = await supabase.from('meal_option_foods').insert({
    option_id: optionId,
    food_id,
    quantity_grams,
  });

  if (error) return { error: error.message };
  revalidatePath(`/nutricion/${clientId}`);
  return { success: true };
}

export async function removeFoodFromOption(id: string, clientId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('meal_option_foods').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/nutricion/${clientId}`);
  return { success: true };
}
