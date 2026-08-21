import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NewClientForm } from './NewClientForm';

export default async function ClientesPage() {
  const supabase = createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, email, status, goal, start_date')
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white">Clientes</h1>
          <p className="mt-1 text-sm text-muted">{clients?.length ?? 0} en total</p>
        </div>
      </div>

      <NewClientForm />

      <div className="rounded-xl2 border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="px-5 py-3 font-normal">Nombre</th>
              <th className="px-5 py-3 font-normal">Objetivo</th>
              <th className="px-5 py-3 font-normal">Estado</th>
              <th className="px-5 py-3 font-normal">Desde</th>
              <th className="px-5 py-3 font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client.id} className="border-b border-line last:border-0 hover:bg-panel2">
                <td className="px-5 py-3">
                  <Link href={`/clientes/${client.id}`} className="text-white hover:text-cyan">
                    {client.full_name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted">{client.goal ?? '—'}</td>
                <td className="px-5 py-3 text-muted capitalize">{client.status}</td>
                <td className="px-5 py-3 text-muted">
                  {new Date(client.start_date).toLocaleDateString('es-ES')}
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-3 text-xs">
                    <Link href={`/entrenamiento/${client.id}`} className="text-cyan hover:underline">
                      Entreno
                    </Link>
                    <Link href={`/nutricion/${client.id}`} className="text-cyan hover:underline">
                      Nutrición
                    </Link>
                    <Link href={`/clientes/${client.id}/progreso`} className="text-cyan hover:underline">
                      Progreso
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {(!clients || clients.length === 0) && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted">
                  Todavía no has dado de alta a ningún cliente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
