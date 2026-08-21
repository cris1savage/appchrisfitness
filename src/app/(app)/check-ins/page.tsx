import { createClient } from '@/lib/supabase/server';
import { TemplateForm } from './TemplateForm';
import { TemplateList } from './TemplateList';
import { ScheduleForm } from './ScheduleForm';
import { ScheduleList } from './ScheduleList';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default async function CheckinsPage() {
  const supabase = createClient();

  const [{ data: templates }, { data: clients }, { data: schedules }, { data: responses }] =
    await Promise.all([
      supabase.from('checkin_templates').select('id, name, questions').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, full_name').order('full_name'),
      supabase
        .from('checkin_schedule')
        .select('id, day_of_week, client_id, template_id, clients(full_name), checkin_templates(name)')
        .order('day_of_week'),
      supabase
        .from('checkin_responses')
        .select('id, submitted_at, answers, client_id, clients(full_name), checkin_templates(name)')
        .order('submitted_at', { ascending: false })
        .limit(10),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">Check-ins</h1>
        <p className="mt-1 text-sm text-muted">Plantillas de preguntas, calendario por cliente y últimas respuestas.</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg tracking-wide text-white">Plantillas</h2>
        <TemplateForm />
        <TemplateList templates={templates ?? []} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg tracking-wide text-white">Calendario de check-ins</h2>
        <ScheduleForm clients={clients ?? []} templates={templates ?? []} days={DAYS} />
        <ScheduleList schedules={(schedules ?? []) as any} days={DAYS} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg tracking-wide text-white">Últimas respuestas</h2>
        <div className="rounded-xl2 border border-line bg-panel">
          {responses && responses.length > 0 ? (
            <ul className="divide-y divide-line">
              {responses.map((r: any) => (
                <li key={r.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-white">
                      {r.clients?.full_name} · <span className="text-muted">{r.checkin_templates?.name}</span>
                    </p>
                    <p className="text-xs text-muted">{new Date(r.submitted_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    {Object.entries(r.answers ?? {}).map(([q, a]) => (
                      <p key={q} className="text-sm text-muted">
                        <span className="text-white">{q}:</span> {String(a)}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-muted">Todavía no hay respuestas.</p>
          )}
        </div>
      </section>
    </div>
  );
}
