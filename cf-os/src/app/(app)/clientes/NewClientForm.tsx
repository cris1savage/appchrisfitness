'use client';

import { useState, useTransition } from 'react';
import { createClientWithInvitation } from './actions';

export function NewClientForm() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setInviteLink(null);

    startTransition(async () => {
      const result = await createClientWithInvitation(formData);

      if ('error' in result && result.error) {
        setError(result.error);
        return;
      }

      if ('token' in result && result.token) {
        const link = `${window.location.origin}/invitacion/${result.token}`;
        setInviteLink(link);
      }
    });
  }

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-fit rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
      >
        + Nuevo cliente
      </button>
    );
  }

  return (
    <div className="rounded-xl2 border border-line bg-panel p-5">
      {!inviteLink ? (
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-muted">Nombre completo</label>
              <input
                name="full_name"
                required
                className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-muted">Objetivo</label>
            <input
              name="goal"
              placeholder="Ej. Pérdida de grasa manteniendo fuerza"
              className="w-full rounded-lg border border-line bg-panel2 px-3 py-2.5 text-white outline-none focus:border-cyan"
            />
          </div>

          {error && <p className="text-sm text-risk-high">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Creando…' : 'Crear cliente y generar invitación'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm text-muted hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-risk-ok">Cliente creado. Envíale este link por WhatsApp:</p>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-2.5">
            <code className="flex-1 truncate text-sm text-white">{inviteLink}</code>
            <button
              onClick={copyLink}
              className="shrink-0 rounded-lg bg-cyan px-3 py-1.5 text-xs font-semibold text-ink hover:opacity-90"
            >
              {copied ? 'Copiado ✓' : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-muted">Caduca en 7 días. Puedes regenerarlo desde la ficha del cliente.</p>
          <button
            onClick={() => {
              setOpen(false);
              setInviteLink(null);
            }}
            className="w-fit text-sm text-cyan hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
