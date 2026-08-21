'use client';

import { useState, useTransition } from 'react';
import { createTemplate } from './actions';

export function TemplateForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTemplate(formData);
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
        + Nueva plantilla
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-xl2 border border-line bg-panel p-5">
      <div>
        <label className="mb-1.5 block text-sm text-muted">Nombre de la plantilla</label>
        <input name="name" required placeholder="Ej. Check semanal rápido" className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-muted">Preguntas (una por línea)</label>
        <textarea
          name="questions"
          required
          rows={5}
          placeholder={'¿Cómo ha ido tu adherencia esta semana?\n¿Cómo has dormido?\n¿Algún dolor o molestia?'}
          className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan"
        />
      </div>

      {error && <p className="text-sm text-risk-high">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-50">
          {isPending ? 'Guardando…' : 'Guardar plantilla'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-muted hover:text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}
