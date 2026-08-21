'use client';

import { useTransition } from 'react';
import { logWeight } from './actions';

export function LogWeightForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await logWeight(clientId, formData);
      (document.getElementById('log-weight-form') as HTMLFormElement)?.reset();
    });
  }

  return (
    <form id="log-weight-form" action={handleSubmit} className="flex items-end gap-3">
      <div>
        <label className="mb-1.5 block text-xs text-muted">Fecha</label>
        <input name="logged_at" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-lg border border-line bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-cyan" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-muted">Peso (kg)</label>
        <input name="weight" type="number" step="0.1" required className="rounded-lg border border-line bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-cyan" />
      </div>
      <button type="submit" disabled={isPending} className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-ink hover:opacity-90">
        Registrar
      </button>
    </form>
  );
}
