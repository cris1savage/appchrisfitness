# Chris Fitness - Documentación para Claude

## 🎯 Visión

Construir una app de entrenamiento online **minimalista, moderna y fluida** similar a Hubfit, donde los clientes tienen acceso completo a todo ("al 200%"): entrenamientos, nutrición, progreso, check-ins, todo visual y profesional.

**Inspiración**: Hubfit (diseño limpio, sin clutter, bordes redondeados, colores sobrios azul/blanco)

---

## 📁 Estructura del Proyecto

```
appchrisfitness/
├── src/                          # Web app (Next.js)
│   ├── app/
│   │   ├── (app)/               # Layout protegido (coaches)
│   │   ├── (cliente)/           # Layout para clientes
│   │   ├── auth/                # Login, registro
│   │   ├── api/                 # API routes
│   │   └── ...
│   ├── components/              # Componentes React
│   ├── lib/                      # Utilidades
│   └── config/                   # Configuración
├── mobile/                       # App móvil (React Native/Expo)
│   ├── src/
│   │   ├── screens/             # Pantallas
│   │   ├── components/          # Componentes
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilidades
│   │   ├── context/             # Context API
│   │   └── navigation/          # React Navigation
│   └── ...
├── supabase/
│   └── migrations/              # SQL migrations
├── .github/
│   └── workflows/               # GitHub Actions CI/CD
└── package.json
```

---

## 🔑 Características Principales

### 1. Autenticación
- ✅ Supabase Auth (email + password)
- ✅ Roles: `admin` (coach) y `client` (cliente)
- ✅ Recuperación de contraseña
- ✅ Invitaciones para nuevos clientes

### 2. Cliente
- 📊 Dashboard minimalista (tareas, próximo entrenamiento, progreso)
- 💪 Entrenamientos: seleccionar día, ver ejercicios, ejecutar con timer
- 🥗 Nutrición: planes, macros, opciones de comidas, registro
- 📈 Progreso: gráficos de peso, galería de fotos, check-ins
- 👤 Perfil: datos personales, historial, configuración

### 3. Coach (Admin)
- 📊 Dashboard: clientes totales, entrenamientos activos, adherencia
- 👥 Gestión de clientes: crear, editar, ver estadísticas
- 📋 Programación: crear entrenamientos, planes de nutrición
- 📈 Reportes: progreso individual, tendencias

### 4. Móvil
- 📱 Offline-first: funciona sin conexión
- ⏱️ Rest timer: con vibración, sonido, atajos de tiempo
- 🔔 Notificaciones: recordatorios automáticos (check-in, entrenamiento, nutrición)
- ↔️ Sync automático: cuando vuelve la conexión
- 📊 Mismo diseño Hubfit que la web

---

## 🗄️ Base de Datos

### Tablas Principales

```sql
-- Autenticación
auth.users              -- Usuarios de Supabase

-- Perfiles y Clientes
profiles                -- Extendido: role, full_name
clients                 -- Relación coach-cliente

-- Entrenamientos
training_blocks         -- Bloques de entrenamiento
training_days           -- Días del bloque
training_exercises      -- Ejercicios de cada día
exercise_logs          -- Historial de series completadas
exercises_library      -- Librería de ejercicios

-- Nutrición
nutrition_plans        -- Planes de nutrición
meals                  -- Comidas del plan
meal_options           -- Opciones de comidas
meal_option_foods      -- Alimentos en cada opción
foods_library          -- Librería de alimentos

-- Progreso
weight_goals           -- Objetivos de peso
weight_logs            -- Registro de pesajes
progress_photos        -- Fotos de progreso
weight_goals           -- Objetivos

-- Check-ins
checkin_templates      -- Preguntas predefinidas
checkin_schedule       -- Cuándo hacer check-ins
checkin_responses      -- Respuestas del cliente

-- Admin
invitations            -- Invitaciones a clientes
```

### Row-Level Security (RLS)

- ✅ Clientes ven solo sus datos
- ✅ Coaches ven todos sus clientes
- ✅ Admin (sistema) acceso total

---

## 🎨 Diseño (Hubfit Style)

### Colores
- Primario: Azul marino (`#1E3A8A`)
- Secundario: Blanco, grises claros
- Acentos: Verde (completado), Rojo (error)

### Tipografía
- Familia: Sistema sans-serif (SF Pro, Segoe UI, Roboto)
- Tamaños: H1 (28px), H2 (20px), Body (14px), Caption (12px)

### Componentes
- Tarjetas con bordes redondeados (12-20px)
- Botones redondeados (8-12px)
- Espaciado generoso (16px entre secciones)
- Sombras sutiles
- Animaciones suaves (200-300ms)

### Responsive
- Mobile-first
- Breakpoints: 640px (sm), 768px (md), 1024px (lg)

---

## 🔧 Stack Tecnológico

### Web
- **Framework**: Next.js 15.5.26
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Autenticación**: Supabase Auth Helpers
- **Base de datos**: Supabase (PostgreSQL)
- **Deploy**: Vercel

### Mobile
- **Framework**: React Native (Expo SDK 57)
- **Lenguaje**: TypeScript
- **UI**: React Native Paper
- **Navegación**: React Navigation
- **Storage**: AsyncStorage (offline)
- **Notificaciones**: expo-notifications
- **Base de datos**: Supabase

### Backend
- **Base de datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage (fotos)
- **RLS**: Row-Level Security policies

---

## 🔐 Seguridad

- ✅ Contraseñas hasheadas (Supabase Auth)
- ✅ Tokens JWT
- ✅ Cookies seguras (httpOnly, Secure, SameSite)
- ✅ CORS configurado
- ✅ RLS en todas las tablas
- ✅ Validación servidor y cliente
- ✅ HTTPS en producción
- ✅ Rate limiting (en API routes)

---

## 🚀 Despliegue

### Web (Vercel)
1. Conecta repo a Vercel
2. Configura variables de entorno
3. Deploy automático en push a `main`

### Mobile (EAS)
1. Configura cuenta EAS (Expo)
2. Crea build con `eas build`
3. Publica en App Store / Google Play con `eas submit`

### Database (Supabase)
1. Ejecuta migrations con `supabase migration up`
2. O manualmente en SQL Editor de Supabase

---

## 📝 Convenciones

### Nombres
- **Tablas**: snake_case (singular: `client`, `training_day`)
- **Columnas**: snake_case (`user_id`, `created_at`)
- **Componentes**: PascalCase (`ClientDashboard`, `RestTimer`)
- **Funciones**: camelCase (`getClientData`, `syncOfflineSets`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Estilos
- Tailwind classes para estilos
- CSS modules para componentes complejos
- Evitar inline styles

### Commits
```
<tipo>: <descripción breve>

<descripción detallada si es necesaria>

Co-Authored-By: Claude <noreply@anthropic.com>
Claude-Session: <URL>
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

---

## ✅ Testing

### Web
```bash
npm run test              # Jest
npm run test:watch       # Modo watch
npm run test:coverage    # Coverage report
```

### Mobile
```bash
cd mobile
npm run test
npm run test:watch
npm run test:coverage
cd ..
```

---

## 🐛 Troubleshooting

### Error: "Database tables not found"
→ Ejecuta la migración SQL en Supabase

### Error: "Unauthorized" en API
→ Verifica que las variables de entorno están correctas
→ Verifica que el token de Supabase es válido

### Mobile: "Can't connect to Supabase"
→ Verifica las variables en `mobile/.env`
→ Comprueba que tienes conexión a internet
→ Verifica que el proyecto Supabase está activo

### Web: "Styles not loading"
→ Ejecuta `npm run build` en modo producción
→ Verifica que Tailwind CSS está configurado en `tailwind.config.ts`

---

## 📞 Contacto

**Email Coach**: chriisfitness@gmail.com

---

## 📚 Referencias

- [Next.js Docs](https://nextjs.org/docs)
- [React Native Docs](https://reactnative.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Expo Docs](https://docs.expo.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Última actualización**: Octubre 1, 2026
**Versión**: 2.0
**Estado**: Listo para lanzamiento ✅
