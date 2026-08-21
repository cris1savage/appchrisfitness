'use client';

import { useState, useTransition } from 'react';
import { createExercise } from './actions';

export function ExerciseForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createExercise(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      (document.getElementById('exercise-form') as HTMLFormElement)?.reset();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-fit rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90"
      >
        + Nuevo ejercicio
      </button>
    );
  }

  return (
    <form id="exercise-form" action={handleSubmit} className="flex flex-col gap-4 rounded-xl2 border border-line bg-panel p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-muted">Nombre del ejercicio</label>
          <input name="name" required className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-muted">Link de YouTube (vídeo técnica)</label>
          <input name="video_url" type="url" placeholder="https://youtube.com/..." className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-muted">Descripción</label>
        <textarea name="description" rows={2} className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-muted">Técnica / claves</label>
          <textarea name="technique_notes" rows={2} className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-muted">Errores frecuentes</label>
          <textarea name="common_mistakes" rows={2} className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
        </div>
      </div>

      {error && <p className="text-sm text-risk-high">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-50">
          {isPending ? 'Guardando…' : 'Guardar ejercicio'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-muted hover:text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}
