# Guía de lanzamiento — Chris Fitness

Web (Vercel) + app iOS/Android (Expo), las dos sobre el **mismo Supabase**.
Marca cada casilla según avances. Los pasos con 👤 solo los puedes hacer tú (cuentas y pagos).

---

## 0. Antes de nada (30 min)

- [ ] **Guardar el esquema de la base de datos en el repo.** Ahora mismo solo existe dentro de Supabase.
      Supabase → *Database → Backups* o, con la CLI:
      `npx supabase login && npx supabase link --project-ref TU_REF && npx supabase db dump -f supabase/schema.sql`
      Súbelo a `supabase/schema.sql`. Si un día se pierde el proyecto, con esto se recrea.
- [ ] Rellenar `src/config/legal.ts` (nombre/razón social, NIF, dirección, email). Aparece en `/privacidad`.
- [ ] Revisar en Supabase → *Authentication → Policies* que **todas las tablas tienen RLS activado**.
      Es lo que impide que un cliente vea datos de otro (la web y la app confían en ello).

## 1. Supabase de producción (1 h) 👤

- [ ] Plan **Pro** (el gratuito se pausa tras 7 días sin uso).
- [ ] *Authentication → URL Configuration*:
  - Site URL: `https://app.tudominio.com`
  - Redirect URLs: `https://app.tudominio.com/auth/confirm`
- [ ] *Authentication → SMTP*: conectar un proveedor de email (Resend, Brevo…). Sin esto los emails de
      "recuperar contraseña" se limitan a unos pocos por hora.
- [ ] Ejecutar `cf_os_storage_setup.sql` (bucket privado de fotos) si no está ya.
- [ ] Crear tu usuario y ponerle `role = 'admin'` en la tabla `profiles`.

## 2. Web en Vercel (1 h) 👤

- [ ] vercel.com → *Add New Project* → importar `cris1savage/appchrisfitness` (rama `main`).
- [ ] *Settings → Environment Variables* (valores en Supabase → *Project Settings → API*), ver `.env.example`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ secreta
- [ ] *Settings → Domains*: añadir `app.tudominio.com` y crear el registro DNS que indica Vercel.
- [ ] Plan **Pro** si cobras a clientes (el Hobby es solo para uso no comercial).
- [ ] Los cambios solo en `mobile/` no vuelven a publicar la web (`vercel.json`).

**Prueba completa** (hazla tú antes de invitar a nadie):
- [ ] Entrar como coach → crear cliente → copiar enlace de invitación.
- [ ] Abrir el enlace en otro navegador (sin sesión) → aceptar privacidad → crear contraseña.
- [ ] Como cliente: registrar una serie, elegir comida, enviar check-in, registrar peso, subir foto.
- [ ] Como coach: ver la foto en *Clientes → Progreso* y la respuesta en *Check-ins*.
- [ ] "¿Has olvidado tu contraseña?" → llega el email → cambiar contraseña.
- [ ] En el móvil: abrir la web → *Añadir a pantalla de inicio* → se abre como app.

## 3. App móvil (tiendas) 👤

- [ ] Cuentas: **Apple Developer** (99 $/año) y **Google Play Console** (25 $ una vez).
- [ ] `npm i -g eas-cli && eas login`, y en `mobile/`: `eas init` (enlaza el proyecto).
- [ ] Variables para los builds (el archivo `.env` NO se sube a la nube):
  ```bash
  cd mobile
  eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value https://TU-PROYECTO.supabase.co --visibility plaintext
  eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value TU_ANON_KEY --visibility plaintext
  eas env:create --environment production --name EXPO_PUBLIC_WEB_URL --value https://app.tudominio.com --visibility plaintext
  eas env:create --environment production --name EXPO_PUBLIC_CONTACT_EMAIL --value tu@email.com --visibility plaintext
  ```
  (repite con `--environment preview` para los builds de prueba)
- [ ] Sustituir los iconos provisionales de `mobile/assets/` por el logo definitivo (1024×1024).
- [ ] Build de prueba Android: `eas build -p android --profile preview` → instalar el APK en tu móvil.
- [ ] Probar en iPhone con TestFlight: `eas build -p ios --profile production && eas submit -p ios`.
- [ ] Ficha de las tiendas: capturas, descripción, URL de privacidad `https://app.tudominio.com/privacidad`,
      y una **cuenta de prueba de cliente** para los revisores de Apple/Google (la piden porque la app requiere login).
- [ ] Enviar a revisión: `eas submit -p all`.

## 4. Abrir a clientes

- [ ] 2–3 clientes de confianza durante 1–2 semanas (web instalable o TestFlight).
- [ ] Copias de seguridad: comprobar que Supabase Pro las hace a diario.
- [ ] Opcional: avisos de errores con Sentry (web y app).
