'use client';

import { useTransition } from 'react';
import { logMyWeight } from './actions';

export function LogMyWeightForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await logMyWeight(clientId, formData);
      (document.getElementById('my-weight-form') as HTMLFormElement)?.reset();
    });
  }

  return (
    <form id="my-weight-form" action={handleSubmit} className="flex gap-3">
      <input name="weight" type="number" step="0.1" required placeholder="Kg" className="flex-1 rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
      <button type="submit" disabled={isPending} className="rounded-lg bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90">
        {isPending ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}
