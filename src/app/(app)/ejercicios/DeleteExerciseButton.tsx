'use client';

import { useTransition } from 'react';
import { deleteExercise } from './actions';

export function DeleteExerciseButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm('¿Borrar este ejercicio de la biblioteca?')) {
          startTransition(async () => { await deleteExercise(id); });
        }
      }}
      disabled={isPending}
      className="shrink-0 text-xs text-muted hover:text-risk-high"
    >
      Borrar
    </button>
  );
}
