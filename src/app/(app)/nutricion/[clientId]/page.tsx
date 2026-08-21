import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NewPlanForm } from './NewPlanForm';
import { MealsBoard } from './MealsBoard';

export default async function ClientNutritionPage({ params }: { params: { clientId: string } }) {
  const supabase = createClient();

  const [{ data: client }, { data: plans }, { data: foods }] = await Promise.all([
    supabase.from('clients').select('full_name').eq('id', params.clientId).single(),
    supabase
      .from('nutrition_plans')
      .select(
        `id, name, is_active, target_kcal, target_protein, target_carbs, target_fat,
         meals (
           id, name, order_index,
           meal_options (
             id, option_number, is_selected,
             meal_option_foods (
               id, quantity_grams,
               foods_library ( id, name, kcal_per_100, protein_per_100, carbs_per_100, fat_per_100, fiber_per_100 )
             )
           )
         )`
      )
      .eq('client_id', params.clientId)
      .order('created_at', { ascending: false }),
    supabase.from('foods_library').select('id, name, kcal_per_100, protein_per_100, carbs_per_100, fat_per_100').order('name'),
  ]);

  const activePlan = plans?.find((p) => p.is_active) ?? plans?.[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/nutricion" className="text-sm text-muted hover:text-cyan">
          ← Nutrición
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-wide text-white">{client?.full_name}</h1>
      </div>

      {!activePlan && <NewPlanForm clientId={params.clientId} />}

      {activePlan && (
        <MealsBoard
          plan={activePlan as any}
          clientId={params.clientId}
          foods={foods ?? []}
        />
      )}
    </div>
  );
}
