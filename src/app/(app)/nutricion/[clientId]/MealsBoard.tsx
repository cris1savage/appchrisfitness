'use client';

import { useState, useTransition } from 'react';
import { addMeal, addOption, selectOption, addFoodToOption, removeFoodFromOption } from './actions';

type Food = { id: string; name: string; kcal_per_100: number; protein_per_100: number; carbs_per_100: number; fat_per_100: number; fiber_per_100?: number };
type OptionFood = { id: string; quantity_grams: number; foods_library: Food };
type Option = { id: string; option_number: number; is_selected: boolean; meal_option_foods: OptionFood[] };
type Meal = { id: string; name: string; order_index: number; meal_options: Option[] };
type Plan = {
  id: string;
  name: string;
  target_kcal: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fat: number | null;
  meals: Meal[];
};

function calcTotals(foods: OptionFood[]) {
  return foods.reduce(
    (acc, f) => {
      const factor = f.quantity_grams / 100;
      acc.kcal += f.foods_library.kcal_per_100 * factor;
      acc.protein += f.foods_library.protein_per_100 * factor;
      acc.carbs += f.foods_library.carbs_per_100 * factor;
      acc.fat += f.foods_library.fat_per_100 * factor;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function MealsBoard({ plan, clientId, foods }: { plan: Plan; clientId: string; foods: Food[] }) {
  const [isPending, startTransition] = useTransition();
  const [addingMeal, setAddingMeal] = useState(false);

  const selectedTotals = plan.meals.reduce(
    (acc, meal) => {
      const selected = meal.meal_options?.find((o) => o.is_selected);
      if (!selected) return acc;
      const t = calcTotals(selected.meal_option_foods ?? []);
      acc.kcal += t.kcal;
      acc.protein += t.protein;
      acc.carbs += t.carbs;
      acc.fat += t.fat;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl2 border border-line bg-panel p-5">
        <p className="mb-3 font-display text-lg tracking-wide text-white">{plan.name} — Total del día</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <TotalStat label="Kcal" value={selectedTotals.kcal} target={plan.target_kcal} />
          <TotalStat label="Proteína" value={selectedTotals.protein} target={plan.target_protein} unit="g" />
          <TotalStat label="Carbs" value={selectedTotals.carbs} target={plan.target_carbs} unit="g" />
          <TotalStat label="Grasas" value={selectedTotals.fat} target={plan.target_fat} unit="g" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {plan.meals
          ?.sort((a, b) => a.order_index - b.order_index)
          .map((meal) => (
            <MealCard key={meal.id} meal={meal} clientId={clientId} foods={foods} />
          ))}
      </div>

      {addingMeal ? (
        <form
          action={(formData) =>
            startTransition(async () => {
              await addMeal(plan.id, clientId, formData);
              setAddingMeal(false);
            })
          }
          className="flex gap-2"
        >
          <input name="name" required placeholder="Nombre de la comida (ej. Comida 2)" className="flex-1 rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
          <button type="submit" disabled={isPending} className="rounded-lg bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90">
            Añadir
          </button>
          <button type="button" onClick={() => setAddingMeal(false)} className="rounded-lg px-4 py-2.5 text-sm text-muted hover:text-white">
            Cancelar
          </button>
        </form>
      ) : (
        <button onClick={() => setAddingMeal(true)} className="w-fit rounded-xl border border-dashed border-line px-4 py-2.5 text-sm text-muted hover:border-cyan hover:text-cyan">
          + Añadir comida
        </button>
      )}
    </div>
  );
}

function TotalStat({ label, value, target, unit = '' }: { label: string; value: number; target: number | null; unit?: string }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : null;
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display text-2xl text-white">
        {Math.round(value)}
        {unit}
        {target ? <span className="text-base text-muted"> /{target}{unit}</span> : null}
      </p>
      {pct !== null && (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-panel2">
          <div className="h-full bg-cyan" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function MealCard({ meal, clientId, foods }: { meal: Meal; clientId: string; foods: Food[] }) {
  const [isPending, startTransition] = useTransition();
  const options = (meal.meal_options ?? []).sort((a, b) => a.option_number - b.option_number);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(options[0]?.id ?? null);
  const [addingFood, setAddingFood] = useState(false);

  const activeOption = options.find((o) => o.id === activeOptionId) ?? options[0];
  const totals = activeOption ? calcTotals(activeOption.meal_option_foods ?? []) : null;

  return (
    <div className="rounded-xl2 border border-line bg-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-lg tracking-wide text-white">{meal.name}</p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveOptionId(opt.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              opt.id === (activeOption?.id ?? '')
                ? 'border-cyan bg-cyan/10 text-cyan'
                : 'border-line text-muted hover:text-white'
            }`}
          >
            Opción {opt.option_number} {opt.is_selected && '✓'}
          </button>
        ))}
        <button
          onClick={() => startTransition(async () => { await addOption(meal.id, clientId); })}
          disabled={isPending}
          className="rounded-full border border-dashed border-line px-3 py-1.5 text-xs text-muted hover:border-cyan hover:text-cyan"
        >
          + Opción
        </button>
      </div>

      {activeOption && (
        <>
          <ul className="mb-3 flex flex-col divide-y divide-line">
            {activeOption.meal_option_foods?.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-white">
                  {f.quantity_grams}g {f.foods_library.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-muted">
                    {Math.round((f.foods_library.kcal_per_100 * f.quantity_grams) / 100)} kcal
                  </span>
                  <button
                    onClick={() => startTransition(async () => { await removeFoodFromOption(f.id, clientId); })}
                    className="text-xs text-muted hover:text-risk-high"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
            {(!activeOption.meal_option_foods || activeOption.meal_option_foods.length === 0) && (
              <li className="py-2 text-sm text-muted">Sin alimentos todavía en esta opción.</li>
            )}
          </ul>

          {totals && (
            <p className="mb-3 text-xs text-muted">
              Total opción: {Math.round(totals.kcal)} kcal · P {Math.round(totals.protein)}g · C{' '}
              {Math.round(totals.carbs)}g · G {Math.round(totals.fat)}g
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {addingFood ? (
              <form
                action={(formData) =>
                  startTransition(async () => {
                    await addFoodToOption(activeOption.id, clientId, formData);
                    setAddingFood(false);
                  })
                }
                className="flex flex-wrap items-center gap-2"
              >
                <select name="food_id" required className="rounded-lg border border-line bg-panel2 px-2 py-2 text-sm text-white outline-none focus:border-cyan">
                  <option value="">Alimento…</option>
                  {foods.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <input name="quantity_grams" type="number" placeholder="g" required className="w-20 rounded-lg border border-line bg-panel2 px-2 py-2 text-sm text-white outline-none focus:border-cyan" />
                <button type="submit" className="rounded-lg bg-cyan px-3 py-2 text-xs font-semibold text-ink hover:opacity-90">
                  Añadir
                </button>
                <button type="button" onClick={() => setAddingFood(false)} className="text-xs text-muted hover:text-white">
                  Cancelar
                </button>
              </form>
            ) : (
              <button onClick={() => setAddingFood(true)} className="text-xs text-cyan hover:underline">
                + Añadir alimento
              </button>
            )}

            {!activeOption.is_selected && (
              <button
                onClick={() => startTransition(async () => { await selectOption(activeOption.id, meal.id, clientId); })}
                className="text-xs text-cyan hover:underline"
              >
                Marcar como opción activa (cuenta para el total)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
