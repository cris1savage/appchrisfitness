'use client';

import { useTransition } from 'react';
import { removeSchedule } from './actions';

type Schedule = {
  id: string;
  day_of_week: number;
  clients: { full_name: string } | { full_name: string }[] | null;
  checkin_templates: { name: string } | { name: string }[] | null;
};

export function ScheduleList({ schedules, days }: { schedules: Schedule[]; days: string[] }) {
  const [isPending, startTransition] = useTransition();

  if (schedules.length === 0) {
    return <p className="rounded-xl2 border border-line bg-panel px-5 py-8 text-center text-muted">Todavía no hay check-ins programados.</p>;
  }

  return (
    <div className="rounded-xl2 border border-line bg-panel">
      <ul className="divide-y divide-line">
        {schedules.map((s) => {
          const client = Array.isArray(s.clients) ? s.clients[0] : s.clients;
          const template = Array.isArray(s.checkin_templates) ? s.checkin_templates[0] : s.checkin_templates;
          return (
            <li key={s.id} className="flex items-center justify-between px-5 py-3">
              <p className="text-sm text-white">
                {client?.full_name} · <span className="text-muted">{template?.name}</span> ·{' '}
                <span className="text-cyan">{days[s.day_of_week]}</span>
              </p>
              <button
                onClick={() => startTransition(async () => { await removeSchedule(s.id); })}
                disabled={isPending}
                className="text-xs text-muted hover:text-risk-high"
              >
                Quitar
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
