'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/mi-entrenamiento', label: 'Entreno' },
  { href: '/mi-nutricion', label: 'Nutrición' },
  { href: '/mi-checkin', label: 'Check-in' },
  { href: '/mi-progreso', label: 'Progreso' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-line bg-panel">
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 py-3 text-center text-xs ${active ? 'text-cyan' : 'text-muted'}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function TopBar() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-line bg-panel px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel2 border border-line">
          <span className="font-display text-xs text-cyan">CF</span>
        </div>
        <span className="font-display text-sm tracking-wide text-white">CF OS</span>
      </div>
      <button onClick={handleLogout} className="text-xs text-muted hover:text-white">
        Salir
      </button>
    </header>
  );
}
