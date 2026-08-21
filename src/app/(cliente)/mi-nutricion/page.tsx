import { createClient } from '@/lib/supabase/server';
import { getMyClientId } from '@/lib/getMyClientId';
import { OptionPicker } from './OptionPicker';

export default async function MiNutricionPage() {
  const clientId = await getMyClientId();
  const supabase = createClient();

  if (!clientId) {
    return <p className="text-center text-muted">No se ha podido identificar tu cuenta de cliente.</p>;
  }

  const { data: plan } = await supabase
    .from('nutrition_plans')
    .select(
      `id, name, target_kcal, target_protein, target_carbs, target_fat,
       meals (
         id, name, order_index,
         meal_options (
           id, option_number, is_selected,
           meal_option_foods (
             id, quantity_grams,
             foods_library ( name, kcal_per_100, protein_per_100, carbs_per_100, fat_per_100 )
           )
         )
       )`
    )
    .eq('client_id', clientId)
    .eq('is_active', true)
    .maybeSingle();

  if (!plan) {
    return <p className="text-center text-muted">Todavía no tienes un plan de nutrición activo.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-wide text-white">{plan.name}</h1>
        <a href={`/mi-nutricion/pdf`} className="rounded-lg border border-line px-3 py-1.5 text-xs text-cyan hover:border-cyan">
          Descargar PDF
        </a>
      </div>

      {(plan.meals ?? [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((meal: any) => (
          <OptionPicker key={meal.id} meal={meal} />
        ))}
    </div>
  );
}
