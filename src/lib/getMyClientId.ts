import { createClient } from '@/lib/supabase/server';

export async function getMyClientId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: client } = await supabase.from('clients').select('id').eq('profile_id', user.id).single();

  return client?.id ?? null;
}
