import { createClient } from '@/lib/supabase/server';
import { getMyClientId } from '@/lib/getMyClientId';
import { PrintButton } from './PrintButton';

export default async function NutricionPdfPage() {
  const clientId = await getMyClientId();
  const supabase = createClient();

  const { data: client } = await supabase.from('clients').select('full_name').eq('id', clientId).single();

  const { data: plan } = await supabase
    .from('nutrition_plans')
    .select(
      `name, target_kcal, target_protein, target_carbs, target_fat,
       meals (
         name, order_index,
         meal_options (
           option_number, is_selected,
           meal_option_foods ( quantity_grams, foods_library ( name, kcal_per_100, protein_per_100, carbs_per_100, fat_per_100 ) )
         )
       )`
    )
    .eq('client_id', clientId)
    .eq('is_active', true)
    .maybeSingle();

  if (!plan) return <p className="p-6 text-muted">No hay plan activo.</p>;

  return (
    <div className="mx-auto max-w-2xl bg-white px-8 py-10 text-ink print:px-0">
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 print:hidden">
        <p className="text-sm text-gray-500">Vista previa — usa el botón para guardar como PDF</p>
        <PrintButton />
      </div>

      <h1 className="font-display text-2xl tracking-wide text-black">Chris Fitness — {plan.name}</h1>
      <p className="mt-1 text-sm text-gray-600">{client?.full_name}</p>

      {(plan.meals ?? [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((meal: any, i: number) => {
          const selected = meal.meal_options?.find((o: any) => o.is_selected) ?? meal.meal_options?.[0];
          return (
            <div key={i} className="mt-6">
              <h2 className="font-display text-lg text-black">{meal.name}</h2>
              <ul className="mt-1 flex flex-col gap-0.5">
                {selected?.meal_option_foods?.map((f: any, j: number) => (
                  <li key={j} className="text-sm text-gray-700">
                    {f.quantity_grams}g {f.foods_library.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

      <p className="mt-8 text-xs text-gray-500">
        Objetivo diario: {plan.target_kcal ?? '—'} kcal · P {plan.target_protein ?? '—'}g · C {plan.target_carbs ?? '—'}g · G{' '}
        {plan.target_fat ?? '—'}g
      </p>
    </div>
  );
}
