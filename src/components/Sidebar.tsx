'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clientes', label: 'Clientes' },
  { href: '/entrenamiento', label: 'Entrenamiento' },
  { href: '/nutricion', label: 'Nutrición' },
  { href: '/check-ins', label: 'Check-ins' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="flex h-screen w-60 flex-col justify-between border-r border-line bg-panel px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-panel2 border border-line">
            <span className="font-display text-sm text-cyan">CF</span>
          </div>
          <span className="font-display text-sm tracking-wide text-white">CF OS</span>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-panel2 text-cyan font-medium'
                    : 'text-muted hover:bg-panel2 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-panel2 hover:text-white"
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
