'use client';

import { useState, useTransition } from 'react';
import { submitCheckin } from './actions';

type Question = { id: string; label: string; type: string };

export function CheckinForm({ clientId, templateId, questions }: { clientId: string; templateId: string; questions: Question[] }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await submitCheckin(clientId, templateId, formData);
      setSent(true);
    });
  }

  if (sent) {
    return <p className="text-sm text-risk-ok">Check-in enviado. ¡Gracias!</p>;
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      {questions.map((q) => (
        <div key={q.id}>
          <label className="mb-1 block text-sm text-muted">{q.label}</label>
          <textarea name={`q_${q.label}`} rows={2} className="w-full rounded-lg border border-line bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-cyan" />
        </div>
      ))}
      <button type="submit" disabled={isPending} className="w-fit rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-ink hover:opacity-90">
        {isPending ? 'Enviando…' : 'Enviar check-in'}
      </button>
    </form>
  );
}
