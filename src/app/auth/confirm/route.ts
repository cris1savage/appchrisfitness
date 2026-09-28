import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/confirm — destino de los enlaces de email de Supabase (recuperar contraseña).
 * Acepta tanto ?code= (flujo PKCE por defecto) como ?token_hash=&type= (plantilla de email personalizada).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const nextParam = searchParams.get('next') ?? '/post-login';
  // Solo rutas internas, para que nadie use el enlace como redirección a otra web
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/post-login';

  const supabase = await createClient();
  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }

  return NextResponse.redirect(new URL(ok ? next : '/recuperar?error=enlace', origin));
}
