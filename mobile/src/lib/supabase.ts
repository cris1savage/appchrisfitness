import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** false si falta el .env: la app muestra un aviso en vez de fallar al arrancar */
export const isSupabaseConfigured = Boolean(url && anonKey);

// Es el mismo proyecto de Supabase que usa la web. La clave "anon" es pública por diseño:
// la seguridad la ponen las reglas RLS de la base de datos. NUNCA pongas aquí la service_role.
export const supabase = createClient(url ?? 'https://no-configurado.supabase.co', anonKey ?? 'no-configurado', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Refresca el token solo con la app en primer plano (recomendación de Supabase para React Native)
AppState.addEventListener('change', state => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
