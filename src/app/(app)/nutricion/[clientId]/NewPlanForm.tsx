'use client';

import { useState, useTransition } from 'react';
import { createPlan } from './actions';

export function NewPlanForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createPlan(clientId, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-xl2 border border-line bg-panel p-5">
      <p className="text-sm text-muted">Este cliente todavía no tiene plan de nutrición. Crea el primero:</p>
      <div>
        <label className="mb-1.5 block text-sm text-muted">Nombre del plan</label>
        <input name="name" required placeholder="Ej. Plan fase definición" className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted">Kcal objetivo</label>
          <input name="target_kcal" type="number" className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Proteína (g)</label>
          <input name="target_protein" type="number" className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Carbs (g)</label>
          <input name="target_carbs" type="number" className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Grasas (g)</label>
          <input name="target_fat" type="number" className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
      </div>

      {error && <p className="text-sm text-risk-high">{error}</p>}

      <button type="submit" disabled={isPending} className="w-fit rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-50">
        {isPending ? 'Creando…' : 'Crear plan'}
      </button>
    </form>
  );
}
