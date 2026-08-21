import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NewBlockForm } from './NewBlockForm';

export default async function ClientTrainingPage({ params }: { params: { clientId: string } }) {
  const supabase = createClient();

  const [{ data: client }, { data: blocks }] = await Promise.all([
    supabase.from('clients').select('full_name').eq('id', params.clientId).single(),
    supabase
      .from('training_blocks')
      .select('id, name, length_days, start_date, is_active')
      .eq('client_id', params.clientId)
      .order('start_date', { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/entrenamiento" className="text-sm text-muted hover:text-cyan">
          ← Entrenamiento
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-wide text-white">{client?.full_name}</h1>
        <p className="mt-1 text-sm text-muted">Bloques de entrenamiento (no atados a la semana natural)</p>
      </div>

      <NewBlockForm clientId={params.clientId} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {blocks?.map((block) => (
          <Link
            key={block.id}
            href={`/entrenamiento/${params.clientId}/${block.id}`}
            className="rounded-xl2 border border-line bg-panel px-5 py-4 transition-colors hover:border-cyan"
          >
            <p className="text-white">{block.name}</p>
            <p className="mt-1 text-sm text-muted">{block.length_days} días · desde {new Date(block.start_date).toLocaleDateString('es-ES')}</p>
            {block.is_active && <span className="mt-2 inline-block rounded-full bg-cyan/15 px-2 py-0.5 text-xs text-cyan">Activo</span>}
          </Link>
        ))}

        {(!blocks || blocks.length === 0) && (
          <p className="col-span-full py-6 text-center text-muted">Todavía no hay bloques para este cliente.</p>
        )}
      </div>
    </div>
  );
}
