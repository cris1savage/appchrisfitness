'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createClientWithInvitation(formData: FormData) {
  const supabase = createClient();

  const full_name = String(formData.get('full_name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const goal = String(formData.get('goal') ?? '').trim();

  if (!full_name || !email) {
    return { error: 'Nombre y email son obligatorios.' };
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({ full_name, email, goal: goal || null })
    .select('id')
    .single();

  if (clientError || !client) {
    return { error: clientError?.message ?? 'No se pudo crear el cliente.' };
  }

  const { data: invitation, error: invitationError } = await supabase
    .from('invitations')
    .insert({ client_id: client.id })
    .select('token')
    .single();

  if (invitationError || !invitation) {
    return { error: invitationError?.message ?? 'Cliente creado, pero falló la invitación.' };
  }

  revalidatePath('/clientes');

  return { success: true, token: invitation.token as string };
}
