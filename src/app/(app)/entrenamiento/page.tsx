import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function EntrenamientoPage() {
  const supabase = createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, status')
    .order('full_name');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">Entrenamiento</h1>
        <p className="mt-1 text-sm text-muted">Elige un cliente para ver o crear sus bloques de entrenamiento.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clients?.map((client) => (
          <Link
            key={client.id}
            href={`/entrenamiento/${client.id}`}
            className="rounded-xl2 border border-line bg-panel px-5 py-4 transition-colors hover:border-cyan"
          >
            <p className="text-white">{client.full_name}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">{client.status}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
