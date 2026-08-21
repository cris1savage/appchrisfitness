import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /auth/callback
 * body: { token: string, password: string }
 *
 * Flujo de alta por invitación:
 * 1. Busca la invitación por token, comprueba que no esté caducada ni usada.
 * 2. Crea el usuario en auth.users con la contraseña elegida.
 * 3. Crea su fila en profiles con rol 'client'.
 * 4. Vincula clients.profile_id al nuevo usuario.
 * 5. Marca la invitación como usada.
 */
export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Faltan datos o la contraseña es demasiado corta (mínimo 8 caracteres).' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: invitation, error: invitationError } = await admin
    .from('invitations')
    .select('id, client_id, expires_at, used_at, clients(email, full_name)')
    .eq('token', token)
    .single();

  if (invitationError || !invitation) {
    return NextResponse.json({ error: 'Invitación no válida.' }, { status: 404 });
  }

  if (invitation.used_at) {
    return NextResponse.json({ error: 'Esta invitación ya se ha usado.' }, { status: 400 });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json(
      { error: 'Esta invitación ha caducado. Pide a tu entrenador que te genere una nueva.' },
      { status: 400 }
    );
  }

  const clientRecord = Array.isArray(invitation.clients) ? invitation.clients[0] : invitation.clients;

  const { data: newUser, error: createUserError } = await admin.auth.admin.createUser({
    email: clientRecord.email,
    password,
    email_confirm: true,
  });

  if (createUserError || !newUser?.user) {
    return NextResponse.json(
      { error: createUserError?.message ?? 'No se pudo crear la cuenta.' },
      { status: 500 }
    );
  }

  await admin.from('profiles').insert({
    id: newUser.user.id,
    role: 'client',
    full_name: clientRecord.full_name,
  });

  await admin
    .from('clients')
    .update({ profile_id: newUser.user.id })
    .eq('id', invitation.client_id);

  await admin
    .from('invitations')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invitation.id);

  return NextResponse.json({ success: true, email: clientRecord.email });
}
