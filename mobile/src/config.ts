/** URL de la web (Vercel): se usa para "He olvidado mi contraseña" y la política de privacidad */
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? '').replace(/\/$/, '');
/** Email al que llegan las solicitudes de baja / eliminación de cuenta */
export const CONTACT_EMAIL = process.env.EXPO_PUBLIC_CONTACT_EMAIL ?? '';
