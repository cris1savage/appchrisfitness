'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitCheckin(clientId: string, templateId: string, formData: FormData) {
  const supabase = createClient();

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
