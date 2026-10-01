# Chris Fitness - Guía de Lanzamiento v2

## 🚀 Resumen del Proyecto

**Chris Fitness** es una plataforma moderna y minimalista para entrenamiento online, inspirada en **Hubfit**. La app permite:

- **Clientes**: Acceso completo a entrenamientos, nutrición, progreso y check-ins
- **Coaches**: Dashboard para gestionar clientes, ver métricas y programar entrenamientos

### Stack Tecnológico

- **Web**: Next.js 15.5.26 + TypeScript + Tailwind CSS
- **Mobile**: React Native/Expo SDK 57
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel (web) + GitHub (código)

---

## 📋 Requisitos Previos

### Cuentas y Credenciales

1. **Supabase**
   - URL del proyecto: `xzkixopbsxapihaoabwz.supabase.co`
   - Clave pública: `sb_publishable_ZhCf0_IALqiIUlCDWrW8rg_0MRjR6zP`
   - Clave privada (service role): Disponible en tu panel de Supabase

2. **Vercel** (para deploy web)
   - Conecta tu cuenta de GitHub a Vercel
   - Configura variables de entorno

3. **GitHub** (para CI/CD)
   - Repositorio: `cris1savage/appchrisfitness`
   - Acceso con permiso de push

---

## ⚙️ Configuración

### 1. Ejecutar la Migración de Base de Datos

**CRÍTICO**: Antes de ejecutar la app, debes crear las tablas:

```bash
# En Supabase Dashboard:
# 1. Ve a SQL Editor → New query
# 2. Copia el contenido de supabase/migrations/20261001000000_cf_os_schema.sql
# 3. Haz clic en Run
```

El script creará:
- 18 nuevas tablas para entrenamientos, nutrición, progreso
- Row-Level Security (RLS) para aislar datos por cliente
- Storage bucket para fotos de progreso
- Funciones y triggers automáticos

**Nota**: Es idempotente (seguro ejecutar múltiples veces)

### 2. Variables de Entorno

**Web (.env.local)**
```
NEXT_PUBLIC_SUPABASE_URL=https://xzkixopbsxapihaoabwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ZhCf0_IALqiIUlCDWrW8rg_0MRjR6zP
SUPABASE_SERVICE_ROLE_KEY=[Tu clave privada de Supabase]
```

**Mobile (mobile/.env)**
```
EXPO_PUBLIC_SUPABASE_URL=https://xzkixopbsxapihaoabwz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ZhCf0_IALqiIUlCDWrW8rg_0MRjR6zP
```

### 3. Instalar Dependencias

```bash
# Web
npm install

# Mobile
cd mobile
npm install
cd ..
```

---

## 🏃 Ejecución Local

### Web App

```bash
npm run dev
# Abre http://localhost:3000
```

### Mobile App

```bash
cd mobile
npm start
# Escanea el QR con tu teléfono (requiere app Expo)
```

---

## 🎨 Diseño y UI

### Estilos Hubfit

La app sigue la estética minimalista de Hubfit:

- **Colores**: Azul marino (#1E3A8A) como primario, blanco, grises suave
- **Tipografía**: Sans-serif moderna, jerarquía clara
- **Espaciado**: Generoso, respira bien
- **Bordes**: Redondeados (12-20px)
- **Componentes**: Tarjetas, gradientes, iconos limpios
- **Animaciones**: Suaves, no invasivas

### Pantallas Principales

#### Cliente
- **Dashboard**: Tareas del día, progreso, próximo entrenamiento
- **Entrenamientos**: Calendario, ejercicios, ejecución con timer
- **Nutrición**: Planes, macros, historial
- **Progreso**: Peso, fotos, gráficos
- **Perfil**: Datos, check-ins, galería

#### Coach
- **Dashboard**: Clientes totales, entrenamientos activos, adherencia
- **Clientes**: Lista, métricas individuales
- **Programación**: Crear entrenamientos y planes
- **Reportes**: Análisis de progreso

---

## 📱 Características Implementadas

### Web

✅ Autenticación (login, registro, recuperación)
✅ Role-based access (cliente vs coach)
✅ Dashboard personalizado
✅ PWA (instalable en móvil)
✅ Eliminación de cuenta
✅ Manejo de errores
✅ Privacidad y términos
✅ Responsive design

### Mobile

✅ Autenticación con Supabase
✅ Offline-first (AsyncStorage)
✅ Rest timer con vibración
✅ Notificaciones locales (check-ins)
✅ Sync automático cuando hay conexión
✅ UI minimalista tipo Hubfit

### Backend (Supabase)

✅ Autenticación OAuth
✅ Row-Level Security (RLS)
✅ 18 tablas relacionales
✅ Storage para fotos
✅ Funciones SQL
✅ Triggers automáticos

---

## 🔐 Seguridad

- ✅ Tokens JWT para autenticación
- ✅ Row-Level Security en Supabase
- ✅ Cookies seguras (httpOnly, Secure, SameSite)
- ✅ Validación en servidor y cliente
- ✅ Eliminación de datos personal (RGPD)
- ✅ Encriptación en tránsito (HTTPS)

---

## 📊 Verificación Previo al Lanzamiento

Antes de publicar:

```bash
# 1. Tests
npm run test

# 2. Build (web y mobile)
npm run build
cd mobile && npm run build && cd ..

# 3. Linter
npm run lint

# 4. Type check
npx tsc --noEmit
cd mobile && npx tsc --noEmit && cd ..

# 5. Build mobile para iOS/Android (si es necesario)
cd mobile
eas build --platform ios   # Requiere cuenta EAS
eas build --platform android
cd ..
```

---

## 🚀 Despliegue

### Web (Vercel)

```bash
# 1. Conecta el repo a Vercel
# 2. Configura variables de entorno
# 3. Deploy automático en push a main
```

### Mobile (Google Play / App Store)

```bash
# 1. Configura credenciales de Google/Apple
# 2. Construye APK/IPA con EAS
cd mobile
eas build
eas submit
cd ..
```

---

## 📞 Contacto y Soporte

**Email**: chriisfitness@gmail.com

**Documentación completa**: Ver `CLAUDE.md` y `README.md`

---

## 🎯 Siguiente (Después del Lanzamiento)

- [ ] Análisis de usuarios y feedback
- [ ] Optimizar imágenes y performance
- [ ] A/B testing de UX
- [ ] Agregar más ejercicios a la librería
- [ ] Integraciones con wearables (Apple Watch, Wear OS)
- [ ] Planes de nutrición más detallados
- [ ] Comunidad y social features
- [ ] Suscripciones y monetización

---

**Versión**: 2.0 | **Fecha**: Octubre 1, 2026 | **Estado**: Listo para Lanzamiento ✅
