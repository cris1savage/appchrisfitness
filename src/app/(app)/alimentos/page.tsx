import { createClient } from '@/lib/supabase/server';
import { FoodForm } from './FoodForm';
import { DeleteFoodButton } from './DeleteFoodButton';

export default async function AlimentosPage() {
  const supabase = createClient();

  const { data: foods } = await supabase
    .from('foods_library')
    .select('id, name, kcal_per_100, protein_per_100, carbs_per_100, fat_per_100, fiber_per_100')
    .order('name');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">Alimentos</h1>
        <p className="mt-1 text-sm text-muted">Tu base de alimentos, con macros por 100g. Tú decides qué entra aquí.</p>
      </div>

      <FoodForm />

      <div className="rounded-xl2 border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="px-5 py-3 font-normal">Alimento</th>
              <th className="px-5 py-3 font-normal">Kcal/100g</th>
              <th className="px-5 py-3 font-normal">Prot.</th>
              <th className="px-5 py-3 font-normal">Carbs</th>
              <th className="px-5 py-3 font-normal">Grasas</th>
              <th className="px-5 py-3 font-normal">Fibra</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {foods?.map((food) => (
              <tr key={food.id} className="border-b border-line last:border-0 hover:bg-panel2">
                <td className="px-5 py-3 text-white">{food.name}</td>
                <td className="px-5 py-3 text-muted">{food.kcal_per_100}</td>
                <td className="px-5 py-3 text-muted">{food.protein_per_100}g</td>
                <td className="px-5 py-3 text-muted">{food.carbs_per_100}g</td>
                <td className="px-5 py-3 text-muted">{food.fat_per_100}g</td>
                <td className="px-5 py-3 text-muted">{food.fiber_per_100}g</td>
                <td className="px-5 py-3 text-right">
                  <DeleteFoodButton id={food.id} />
                </td>
              </tr>
            ))}
            {(!foods || foods.length === 0) && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-muted">
                  Todavía no has añadido alimentos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
