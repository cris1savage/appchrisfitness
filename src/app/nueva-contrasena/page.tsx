'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) return setError('Mínimo 8 caracteres.');
    if (password !== confirm) return setError('Las contraseñas no coinciden.');

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError('No se pudo cambiar la contraseña. Vuelve a pedir el enlace.');
      return;
    }

    router.push('/post-login');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-display text-2xl tracking-wide text-white">Nueva contraseña</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-white outline-none transition-colors focus:border-cyan"
            placeholder="Mínimo 8 caracteres"
          />
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-white outline-none transition-colors focus:border-cyan"
            placeholder="Repite la contraseña"
          />
          {error && (
            <p role="alert" className="text-sm text-risk-high">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-cyan px-4 py-3 font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </main>
  );
}
