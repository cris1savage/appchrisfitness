'use client';

import { useTransition } from 'react';
import { deleteTemplate, type CheckinQuestion } from './actions';

export function TemplateList({ templates }: { templates: { id: string; name: string; questions: CheckinQuestion[] }[] }) {
  const [isPending, startTransition] = useTransition();

  if (templates.length === 0) {
    return <p className="rounded-xl2 border border-line bg-panel px-5 py-8 text-center text-muted">Todavía no tienes plantillas.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {templates.map((t) => (
        <div key={t.id} className="rounded-xl2 border border-line bg-panel p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-white">{t.name}</p>
            <button
              onClick={() => {
                if (confirm('¿Borrar esta plantilla?')) startTransition(async () => { await deleteTemplate(t.id); });
              }}
              disabled={isPending}
              className="text-xs text-muted hover:text-risk-high"
            >
              Borrar
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {t.questions?.map((q) => (
              <li key={q.id} className="text-sm text-muted">
                · {q.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
