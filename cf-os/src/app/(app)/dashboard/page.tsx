import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/StatCard';

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ count: activeClients }, { count: pendingCheckins }, { data: recentClients }] =
    await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'activo'),
      // check-ins programados sin respuesta enviada aún (aproximación: se afina con lógica de fechas real)
      supabase.from('checkin_schedule').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase
        .from('clients')
        .select('id, full_name, status, start_date')
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Lo importante de hoy, de un vistazo.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Clientes activos" value={activeClients ?? 0} />
        <StatCard label="Check-ins programados" value={pendingCheckins ?? 0} tone="mid" />
        <StatCard label="Vídeos por revisar" value="—" />
        <StatCard label="Clientes en riesgo" value="—" tone="high" />
      </div>

      <div className="rounded-xl2 border border-line bg-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg tracking-wide text-white">Clientes recientes</h2>
          <Link href="/clientes" className="text-sm text-cyan hover:underline">
            Ver todos
          </Link>
        </div>

        {recentClients && recentClients.length > 0 ? (
          <ul className="flex flex-col divide-y divide-line">
            {recentClients.map((client) => (
              <li key={client.id} className="flex items-center justify-between py-3">
                <span className="text-white">{client.full_name}</span>
                <span className="text-xs uppercase tracking-wide text-muted">{client.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-muted">
            Todavía no hay clientes. Da de alta el primero desde{' '}
            <Link href="/clientes" className="text-cyan hover:underline">
              Clientes
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
