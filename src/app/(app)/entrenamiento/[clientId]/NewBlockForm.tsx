'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBlock } from './actions';

export function NewBlockForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createBlock(clientId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.blockId) {
        router.push(`/entrenamiento/${clientId}/${result.blockId}`);
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-fit rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90">
        + Nuevo bloque
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-xl2 border border-line bg-panel p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm text-muted">Nombre del bloque</label>
          <input name="name" required placeholder="Ej. Bloque 3" className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-muted">Duración (días)</label>
          <input name="length_days" type="number" min={1} max={14} required placeholder="Ej. 9" className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-muted">Fecha de inicio</label>
          <input name="start_date" type="date" required className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
      </div>

      {error && <p className="text-sm text-risk-high">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-50">
          {isPending ? 'Creando…' : 'Crear bloque'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-muted hover:text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}
