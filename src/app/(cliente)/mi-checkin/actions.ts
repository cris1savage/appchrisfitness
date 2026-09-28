'use server';

import { getMyClientId } from '@/lib/getMyClientId';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitCheckin(clientId: string, templateId: string, formData: FormData) {
  // No fiarse del clientId que llega del navegador: debe ser el del usuario con sesión
  if ((await getMyClientId()) !== clientId) return { error: 'No autorizado.' };

  const supabase = await createClient();

  const answers: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (key.startsWith('q_')) answers[key.replace('q_', '')] = String(value);
  });

  const { error } = await supabase.from('checkin_responses').insert({
    client_id: clientId,
    template_id: templateId,
    answers,
  });

  if (error) return { error: error.message };

  revalidatePath('/mi-checkin');
  return { success: true };
}
