'use client';

import { useState, useTransition } from 'react';
import { setWeightGoal } from './actions';

export function GoalForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await setWeightGoal(clientId, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-xl2 border border-line bg-panel p-5">
      <p className="text-sm text-muted">Define el objetivo de peso de este cliente (el ritmo lo decides tú):</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div>
          <label className="mb-1.5 block text-xs text-muted">Peso inicial (kg)</label>
          <input name="start_weight" type="number" step="0.1" required className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Peso objetivo (kg)</label>
          <input name="target_weight" type="number" step="0.1" required className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Fecha inicio</label>
          <input name="start_date" type="date" required className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Fecha objetivo</label>
          <input name="target_date" type="date" required className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Ritmo/semana (kg)</label>
          <input name="weekly_rate" type="number" step="0.1" placeholder="-0.5" className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
      </div>

      {error && <p className="text-sm text-risk-high">{error}</p>}

      <button type="submit" disabled={isPending} className="w-fit rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-50">
        {isPending ? 'Guardando…' : 'Fijar objetivo'}
      </button>
    </form>
  );
}
