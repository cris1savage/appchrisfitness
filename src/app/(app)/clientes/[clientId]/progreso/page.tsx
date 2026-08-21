import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { WeightChart } from './WeightChart';
import { GoalForm } from './GoalForm';
import { LogWeightForm } from './LogWeightForm';
import { PhotoCompare } from './PhotoCompare';

export default async function ProgressPage({ params }: { params: { clientId: string } }) {
  const supabase = createClient();

  const [{ data: client }, { data: goal }, { data: logs }, { data: photos }] = await Promise.all([
    supabase.from('clients').select('full_name').eq('id', params.clientId).single(),
    supabase
      .from('weight_goals')
      .select('start_weight, target_weight, start_date, target_date, weekly_rate')
      .eq('client_id', params.clientId)
      .eq('is_active', true)
      .maybeSingle(),
    supabase.from('weight_logs').select('logged_at, weight').eq('client_id', params.clientId).order('logged_at'),
    supabase
      .from('progress_photos')
      .select('id, taken_at, photo_type, storage_path')
      .eq('client_id', params.clientId)
      .order('taken_at'),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/clientes" className="text-sm text-muted hover:text-cyan">
          ← Clientes
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-wide text-white">{client?.full_name} — Progreso</h1>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg tracking-wide text-white">Peso: objetivo vs. real</h2>
        {!goal && <GoalForm clientId={params.clientId} />}
        {goal && (
          <>
            <WeightChart goal={goal} logs={logs ?? []} />
            <LogWeightForm clientId={params.clientId} />
          </>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg tracking-wide text-white">Fotos — antes / después</h2>
        <PhotoCompare photos={photos ?? []} clientId={params.clientId} />
      </section>
    </div>
  );
}
