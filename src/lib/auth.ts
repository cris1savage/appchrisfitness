import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Role = 'admin' | 'client';

export async function getMyRole(): Promise<Role | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return (profile?.role as Role | undefined) ?? null;
}

/** Para layouts/páginas del coach: si no eres admin, te manda a tu zona. */
export async function requireAdminPage() {
  const role = await getMyRole();
  if (role === null) redirect('/login');
  if (role !== 'admin') redirect('/mi-entrenamiento');
}

/**
 * Para server actions del coach. Las server actions se pueden invocar directamente
 * aunque la página esté protegida, así que cada una comprueba el rol.
 * Devuelve { error } si no es admin, o null si puede continuar.
 */
export async function assertAdmin(): Promise<{ error: string } | null> {
  const role = await getMyRole();
  return role === 'admin' ? null : { error: 'No autorizado.' };
}
