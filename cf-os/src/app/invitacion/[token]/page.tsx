'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function InvitationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    const res = await fetch('/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? 'Algo ha ido mal.');
      return;
    }

    // el usuario ya existe, ahora inicia sesión con la contraseña que acaba de crear
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password,
    });

    setLoading(false);

    if (signInError) {
      router.push('/login');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-panel2 border border-line">
            <span className="font-display text-2xl text-cyan tracking-tight">CF</span>
          </div>
          <h1 className="font-display text-2xl text-white tracking-wide">Bienvenido a CF OS</h1>
          <p className="text-sm text-muted">Crea tu contraseña para activar tu cuenta.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-muted">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-white outline-none transition-colors focus:border-cyan"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm text-muted">
              Repite la contraseña
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-white outline-none transition-colors focus:border-cyan"
            />
          </div>

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
            {loading ? 'Creando cuenta…' : 'Activar mi cuenta'}
          </button>
        </form>
      </div>
    </main>
  );
}
