'use client';

import { useTransition } from 'react';
import { scheduleCheckin } from './actions';

export function ScheduleForm({
  clients,
  templates,
  days,
}: {
  clients: { id: string; full_name: string }[];
  templates: { id: string; name: string }[];
  days: string[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await scheduleCheckin(formData);
      (document.getElementById('schedule-form') as HTMLFormElement)?.reset();
    });
  }

  return (
    <form id="schedule-form" action={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl2 border border-line bg-panel p-4">
      <div>
        <label className="mb-1.5 block text-xs text-muted">Cliente</label>
        <select name="client_id" required className="rounded-lg border border-line bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-cyan">
          <option value="">Elige…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-muted">Plantilla</label>
        <select name="template_id" required className="rounded-lg border border-line bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-cyan">
          <option value="">Elige…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-muted">Día de la semana</label>
        <select name="day_of_week" required className="rounded-lg border border-line bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-cyan">
          {days.map((d, i) => (
            <option key={i} value={i}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={isPending} className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-ink hover:opacity-90">
        Asignar
      </button>
    </form>
  );
}
