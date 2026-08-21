import { createClient } from '@/lib/supabase/server';
import { getMyClientId } from '@/lib/getMyClientId';
import { CheckinForm } from './CheckinForm';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default async function MiCheckinPage() {
  const clientId = await getMyClientId();
  const supabase = createClient();

  if (!clientId) {
    return <p className="text-center text-muted">No se ha podido identificar tu cuenta de cliente.</p>;
  }

  const { data: schedule } = await supabase
    .from('checkin_schedule')
    .select('id, day_of_week, checkin_templates ( id, name, questions )')
    .eq('client_id', clientId)
    .eq('is_active', true);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide text-white">Mi check-in</h1>

      {schedule && schedule.length > 0 ? (
        schedule.map((s: any) => {
          const template = Array.isArray(s.checkin_templates) ? s.checkin_templates[0] : s.checkin_templates;
          return (
            <div key={s.id} className="rounded-xl2 border border-line bg-panel p-4">
              <p className="mb-1 text-sm text-muted">Toca los {DAYS[s.day_of_week]}</p>
              <p className="mb-3 font-display text-base tracking-wide text-white">{template?.name}</p>
              <CheckinForm clientId={clientId} templateId={template?.id} questions={template?.questions ?? []} />
            </div>
          );
        })
      ) : (
        <p className="text-center text-muted">Todavía no tienes ningún check-in asignado.</p>
      )}
    </div>
  );
}
