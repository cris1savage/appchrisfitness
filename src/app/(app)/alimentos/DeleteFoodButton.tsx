'use client';

import { useTransition } from 'react';
import { deleteFood } from './actions';

export function DeleteFoodButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm('¿Borrar este alimento?')) startTransition(async () => { await deleteFood(id); });
      }}
      disabled={isPending}
      className="text-xs text-muted hover:text-risk-high"
    >
      Borrar
    </button>
  );
}
