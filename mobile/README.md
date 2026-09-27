# Chris Fitness — App móvil (iOS y Android)

App en **Expo SDK 57** (React Native 0.86, React 19.2). Un solo código para iOS y Android.

## Arrancar en tu móvil

```bash
cd mobile
npm install
npx expo start
```

Escanea el QR con **Expo Go** (Android) o con la cámara (iPhone).
Usuarios de prueba: `chris@chrisfitness.com` / `1234` (coach) · `carlos@test.com` / `1234` (cliente).

## Antes de subir cambios

```bash
npm run typecheck   # errores de TypeScript
npm test            # recorre todas las pantallas de cliente y coach
npx expo-doctor     # versiones de dependencias compatibles
```

> Para añadir librerías usa **siempre** `npx expo install <paquete>` (no `npm install`):
> elige la versión compatible con el SDK. Mezclar versiones es la causa nº 1 de fallos.

## Publicar en App Store / Google Play

```bash
npm i -g eas-cli
eas login
eas build --platform android --profile preview   # APK para probar
eas build --platform all --profile production    # builds para las tiendas
eas submit --platform all
```

Necesitas cuenta de Apple Developer (99 $/año) y de Google Play Console (25 $ una vez).
Los iconos de `assets/` son provisionales (1024×1024): sustitúyelos por el logo definitivo.

## Pendiente

- Los datos son de prueba (`src/data/mockData.ts`). Siguiente paso: conectar con el mismo
  **Supabase** que usa la web (`../src`), para que coach y clientes compartan datos reales.
  Los puntos a cambiar están marcados con `TODO` (login, check-in, calendario).
