'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function RecuperarForm() {
  const supabase = createClient();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('error') ? 'El enlace ha caducado o ya se ha usado. Pide uno nuevo.' : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm?next=/nueva-contrasena`,
    });

    setLoading(false);
    // Mismo mensaje exista o no la cuenta, para no revelar qué emails están registrados
    if (error && error.status === 429) {
      setError('Demasiados intentos. Espera unos minutos y vuelve a probar.');
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-panel2 border border-line">
            <span className="font-display text-2xl text-cyan tracking-tight">CF</span>
          </div>
          <h1 className="font-display text-2xl text-white tracking-wide">Recuperar contraseña</h1>
          <p className="text-sm text-muted">Te enviaremos un enlace para crear una nueva.</p>
        </div>

        {sent ? (
          <p className="rounded-xl border border-line bg-panel px-4 py-4 text-center text-sm text-muted">
            Si hay una cuenta con <span className="text-white">{email}</span>, recibirás un email en unos minutos. Revisa
            también la carpeta de spam.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-white outline-none transition-colors focus:border-cyan"
                placeholder="tu@email.com"
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
              {loading ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-6 block text-center text-sm text-muted hover:text-cyan">
          ← Volver a entrar
        </Link>
      </div>
    </main>
  );
}

export default function RecuperarPage() {
  return (
    <Suspense>
      <RecuperarForm />
    </Suspense>
  );
}
