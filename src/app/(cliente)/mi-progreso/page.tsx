import { createClient } from '@/lib/supabase/server';
import { getMyClientId } from '@/lib/getMyClientId';
import { LogMyWeightForm } from './LogMyWeightForm';
import { UploadPhotoForm } from './UploadPhotoForm';

export default async function MiProgresoPage() {
  const clientId = await getMyClientId();
  const supabase = createClient();

  if (!clientId) {
    return <p className="text-center text-muted">No se ha podido identificar tu cuenta de cliente.</p>;
  }

  const [{ data: goal }, { data: logs }] = await Promise.all([
    supabase.from('weight_goals').select('start_weight, target_weight, start_date, target_date').eq('client_id', clientId).eq('is_active', true).maybeSingle(),
    supabase.from('weight_logs').select('logged_at, weight').eq('client_id', clientId).order('logged_at', { ascending: false }).limit(10),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide text-white">Mi progreso</h1>

      {goal && (
        <div className="rounded-xl2 border border-line bg-panel p-4">
          <p className="text-sm text-muted">
            Objetivo: {goal.start_weight}kg → {goal.target_weight}kg
          </p>
        </div>
      )}

      <div className="rounded-xl2 border border-line bg-panel p-4">
        <p className="mb-3 font-display text-sm tracking-wide text-white">Registrar peso de hoy</p>
        <LogMyWeightForm clientId={clientId} />
      </div>

      <div className="rounded-xl2 border border-line bg-panel p-4">
        <p className="mb-3 font-display text-sm tracking-wide text-white">Últimos registros</p>
        <ul className="flex flex-col divide-y divide-line">
          {logs?.map((l, i) => (
            <li key={i} className="flex justify-between py-2 text-sm">
              <span className="text-muted">{new Date(l.logged_at).toLocaleDateString('es-ES')}</span>
              <span className="text-white">{l.weight}kg</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl2 border border-line bg-panel p-4">
        <p className="mb-3 font-display text-sm tracking-wide text-white">Subir foto de físico</p>
        <UploadPhotoForm clientId={clientId} />
      </div>
    </div>
  );
}
