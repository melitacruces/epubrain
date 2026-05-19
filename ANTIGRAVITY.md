# EpuBrain — Arquitectura y Convenciones (Antigravity)

Este documento sirve como guía de referencia rápida para el agente **Antigravity** al interactuar y modificar el codebase de EpuBrain.

---

## Tech Stack

| Capa | Elección |
| --- | --- |
| **Framework** | Next.js 16/15 (App Router) + TypeScript `strict` |
| **Estilos** | Tailwind CSS **v4** (configuración en CSS) |
| **Componentes** | shadcn/ui (ubicados en `src/components/ui`) |
| **DB + Auth** | Supabase (Postgres + Auth + RLS) |
| **SSR de sesión** | `@supabase/ssr` (cliente server, browser y middleware) |
| **Markdown** | `@uiw/react-md-editor` (edición) y `react-markdown` (lectura) |

---

## Reglas de Optimización (Crítico)

Para asegurar que EpuBrain mantenga una respuesta instantánea y óptima en todas sus pantallas, sigue estas reglas de desarrollo:

### 1. Evitar Waterfalls de Consultas a Supabase
- **No** encadenes consultas asíncronas consecutivas de base de datos si no dependen directamente del resultado de la anterior.
- Utiliza siempre `Promise.all` para ejecutar de forma paralela consultas que compartan identificadores o parámetros (por ejemplo, el `id` o `project_id` que ya se conoce de la ruta).

### 2. Caché de Petición (Request-scoped caching)
- La autenticación en Supabase (`supabase.auth.getUser()`), perfiles (`profiles`), y las preferencias de usuario (`user_preferences`) deben consultarse utilizando las funciones cacheadas mediante React `cache()` de forma que se realice un único viaje de red al backend de Supabase por petición HTTP:
  - `getAuthenticatedUser()` en `src/lib/supabase/server.ts`
  - `getUserProfile(userId)` en `src/lib/supabase/server.ts`
  - `getUserPreferences()` en `src/lib/preferences.ts`

### 3. Carga Asíncrona Progresiva (Streaming con Suspense)
- Los componentes que carguen datos secundarios o pesados (como `NotesSection`) deben envolverse en límites `<Suspense>` para no retrasar la renderización inicial del esqueleto (shell) de la página principal.

---

## Comandos Útiles

```bash
npm run dev          # Iniciar servidor de desarrollo en localhost:3000
npm run build        # Compilar la aplicación para producción
npm run lint         # Ejecutar linters de código
npm run typecheck    # Ejecutar la verificación de tipos de TypeScript (tsc --noEmit)
```

---

## Estructura de Directorios

- `src/app/`: Rutas del App Router. Las subrutas bajo `(app)` están protegidas.
- `src/components/`: Componentes UI organizados por entidad (`areas`, `projects`, `tasks`, `notes`, `layout`).
- `src/lib/`: Utilidades del backend/frontend (actions, Supabase clients, validaciones, etc.).
- `src/types/`: Definiciones de TypeScript generadas de la base de datos Supabase (`database.ts`).
