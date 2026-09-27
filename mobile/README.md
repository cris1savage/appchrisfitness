# Chris Fitness — App móvil (iOS y Android)

App en **Expo SDK 57** (React Native 0.86, React 19.2). Un solo código para iOS y Android.

## Arrancar en tu móvil

```bash
cd mobile
cp .env.example .env     # y rellena los valores (los mismos de Supabase que usa la web)
npm install
npx expo start
```

Escanea el QR con **Expo Go** (Android) o con la cámara (iPhone) y entra con tu usuario real de la web.

- **Clientes**: inicio, entrenamiento (registrar series), nutrición (elegir opciones), progreso (peso y fotos), check-ins.
- **Coach**: clientes (peso y check-ins de cada uno), últimas respuestas de check-in, biblioteca de ejercicios.
  Crear rutinas, planes y clientes se hace desde el panel web.

## Antes de subir cambios

```bash
npm run typecheck   # errores de TypeScript
npm test            # recorre todas las pantallas de cliente y coach
npx expo-doctor     # versiones de dependencias compatibles
```

> Para añadir librerías usa **siempre** `npx expo install <paquete>` (no `npm install`):
> elige la versión compatible con el SDK. Mezclar versiones es la causa nº 1 de fallos.

## Publicar en App Store / Google Play

Sigue la sección 3 de [`../LANZAMIENTO.md`](../LANZAMIENTO.md).
