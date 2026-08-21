'use client';

import { useState, useTransition } from 'react';
import { createFood } from './actions';

export function FoodForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createFood(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-fit rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90">
        + Nuevo alimento
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-xl2 border border-line bg-panel p-5">
      <div>
        <label className="mb-1.5 block text-sm text-muted">Nombre</label>
        <input name="name" required placeholder="Ej. Pechuga de pavo" className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div>
          <label className="mb-1.5 block text-xs text-muted">Kcal/100g</label>
          <input name="kcal_per_100" type="number" step="0.1" required className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Prot./100g</label>
          <input name="protein_per_100" type="number" step="0.1" required className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Carbs/100g</label>
          <input name="carbs_per_100" type="number" step="0.1" required className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Grasas/100g</label>
          <input name="fat_per_100" type="number" step="0.1" required className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Fibra/100g</label>
          <input name="fiber_per_100" type="number" step="0.1" defaultValue={0} className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
      </div>

      {error && <p className="text-sm text-risk-high">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-50">
          {isPending ? 'Guardando…' : 'Guardar alimento'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-muted hover:text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}
