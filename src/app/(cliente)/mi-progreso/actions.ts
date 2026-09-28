'use server';

import { getMyClientId } from '@/lib/getMyClientId';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function logMyWeight(clientId: string, formData: FormData) {
  // No fiarse del clientId que llega del navegador: debe ser el del usuario con sesión
  if ((await getMyClientId()) !== clientId) return { error: 'No autorizado.' };

  const supabase = await createClient();
  const weight = Number(formData.get('weight') ?? 0);
  if (!weight) return { error: 'Introduce un peso válido.' };

  const { error } = await supabase.from('weight_logs').insert({ client_id: clientId, weight });
  if (error) return { error: error.message };

  revalidatePath('/mi-progreso');
  return { success: true };
}

export async function registerPhoto(clientId: string, storagePath: string, photoType: string) {
  // No fiarse del clientId que llega del navegador: debe ser el del usuario con sesión
  if ((await getMyClientId()) !== clientId) return { error: 'No autorizado.' };

  const supabase = await createClient();
  const { error } = await supabase.from('progress_photos').insert({
    client_id: clientId,
    storage_path: storagePath,
    photo_type: photoType,
  });
  if (error) return { error: error.message };

  revalidatePath('/mi-progreso');
  return { success: true };
}
