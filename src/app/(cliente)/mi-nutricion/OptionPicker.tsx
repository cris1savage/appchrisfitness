'use client';

import { useTransition } from 'react';
import { chooseOption } from './actions';

type Food = { name: string; kcal_per_100: number; protein_per_100: number; carbs_per_100: number; fat_per_100: number };
type OptionFood = { id: string; quantity_grams: number; foods_library: Food };
type Option = { id: string; option_number: number; is_selected: boolean; meal_option_foods: OptionFood[] };
type Meal = { id: string; name: string; meal_options: Option[] };

function totalsFor(foods: OptionFood[]) {
  return foods.reduce(
    (acc, f) => {
      const factor = f.quantity_grams / 100;
      acc.kcal += f.foods_library.kcal_per_100 * factor;
      return acc;
    },
    { kcal: 0 }
  );
}

export function OptionPicker({ meal }: { meal: Meal }) {
  const [isPending, startTransition] = useTransition();
  const options = (meal.meal_options ?? []).sort((a, b) => a.option_number - b.option_number);
  const selected = options.find((o) => o.is_selected) ?? options[0];

  return (
    <div className="rounded-xl2 border border-line bg-panel p-4">
      <p className="mb-3 font-display text-base tracking-wide text-white">{meal.name}</p>

      {options.map((opt) => {
        const totals = totalsFor(opt.meal_option_foods ?? []);
        const isActive = opt.id === selected?.id;
        return (
          <button
            key={opt.id}
            onClick={() => !isActive && startTransition(async () => { await chooseOption(opt.id, meal.id); })}
            disabled={isPending}
            className={`mb-2 w-full rounded-lg border p-3 text-left transition-colors ${
              isActive ? 'border-cyan bg-cyan/10' : 'border-line bg-panel2 hover:border-cyan/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm ${isActive ? 'text-cyan' : 'text-white'}`}>
                Opción {opt.option_number} {isActive && '✓'}
              </p>
              <p className="text-xs text-muted">{Math.round(totals.kcal)} kcal</p>
            </div>
            <p className="mt-1 text-xs text-muted">
              {opt.meal_option_foods?.map((f) => `${f.quantity_grams}g ${f.foods_library.name}`).join(' · ')}
            </p>
          </button>
        );
      })}
    </div>
  );
}
