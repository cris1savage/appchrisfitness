'use client';

import { useState, useTransition } from 'react';
import { logExercise } from './actions';

export function LogExerciseForm({ trainingExerciseId, clientId }: { trainingExerciseId: string; clientId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await logExercise(trainingExerciseId, clientId, formData);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setOpen(false);
      }, 1200);
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-2 w-full rounded-lg border border-dashed border-line py-2 text-xs text-muted hover:border-cyan hover:text-cyan">
        + Registrar serie
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="mt-2 flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1.5">
        <input name="weight" type="number" step="0.5" placeholder="Kg" className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm text-white outline-none focus:border-cyan" />
        <input name="reps" type="number" placeholder="Reps" className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm text-white outline-none focus:border-cyan" />
        <input name="rir" type="number" placeholder="RIR" className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm text-white outline-none focus:border-cyan" />
      </div>
      <textarea name="client_note" placeholder="Nota (ej. posición del banco)" rows={2} className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm text-white outline-none focus:border-cyan" />
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="rounded-md bg-cyan px-3 py-1.5 text-xs font-semibold text-ink hover:opacity-90">
          {saved ? 'Guardado ✓' : isPending ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}
