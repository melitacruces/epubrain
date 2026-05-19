# EpuBrain — Arquitectura y convenciones

EpuBrain es un "segundo cerebro" personal para organizar áreas de la vida
(finanzas, salud, música, dev, etc.). Cada área contiene proyectos, cada
proyecto contiene tareas, y se pueden adjuntar notas en Markdown a cualquier
área, proyecto o tarea.

Este documento describe el estado de la **Fase 1** (fundación): scaffold, auth,
base de datos con RLS, y CRUD funcional de las entidades principales.

---

## Stack

| Capa | Elección |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript `strict` |
| Estilos | Tailwind CSS **v4** (config en CSS) |
| Componentes | shadcn/ui (copiados al repo en `src/components/ui`) |
| DB + Auth | Supabase (Postgres + Auth + RLS) |
| SSR de sesión | `@supabase/ssr` (cliente server / browser / middleware) |
| Temas | `next-themes` (claro/oscuro) |
| Formularios | `react-hook-form` + `zod` |
| Markdown — editar | `@uiw/react-md-editor` |
| Markdown — leer | `react-markdown` + `remark-gfm` |
| Runtime | Node 20+, npm |

**Idioma de la UI:** español. El código (identificadores, comentarios) en inglés.

---

## Estructura del proyecto

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
      reset-password/page.tsx
      layout.tsx              # layout sin sidebar
    (app)/                    # rutas protegidas — requieren sesión
      dashboard/page.tsx
      areas/
        page.tsx              # listado de áreas
        [id]/page.tsx         # detalle de área + proyectos
      projects/
        [id]/page.tsx         # detalle de proyecto + tareas
      tasks/
        [id]/page.tsx         # detalle de tarea + notas
      layout.tsx              # layout con sidebar/topbar
    auth/
      callback/route.ts       # callback de confirmación de email
    layout.tsx                # root layout (ThemeProvider)
    globals.css
  components/
    ui/                       # shadcn primitives
    auth/                     # formularios de login/register/reset
    areas/, projects/, tasks/, notes/   # cards, forms, listados
    markdown/                 # editor + viewer
    layout/                   # sidebar, topbar, theme-toggle
  lib/
    supabase/
      client.ts               # createBrowserClient
      server.ts               # createServerClient (cookies de next/headers)
      middleware.ts           # helper de refresh de sesión
    actions/
      areas.ts, projects.ts, tasks.ts, notes.ts, auth.ts
    validations/              # esquemas zod por entidad
    utils.ts                  # cn(), helpers varios
  types/
    database.ts               # tipos generados de Supabase
supabase/
  migrations/                 # *.sql versionadas en orden cronológico
  config.toml                 # opcional, si se usa el CLI más adelante
middleware.ts                 # protege rutas y refresca la sesión
.env.example                  # plantilla — los valores reales en .env.local
```

### Convención de nombres
- Archivos React: `kebab-case.tsx`. Componentes exportados: `PascalCase`.
- Server actions: nombres en inglés, verbo + entidad (`createArea`, `updateTaskStatus`).
- Tablas y columnas en Postgres: `snake_case`, plural para tablas.
- Migraciones: `YYYYMMDDHHMMSS_descripcion_corta.sql`.

---

## Modelo de datos

Todas las tablas tienen `id uuid default gen_random_uuid()`, `created_at` y
`updated_at` (`timestamptz default now()`). Un trigger global mantiene
`updated_at` al día.

### Tablas

- **`profiles`** — extiende `auth.users` 1:1. Se crea automáticamente con un
  trigger `on_auth_user_created`. Columnas: `id` (PK + FK a `auth.users` on
  delete cascade), `display_name`, `avatar_url`.
- **`areas`** — `user_id`, `name`, `description`, `color`, `icon`,
  `sort_order int`.
- **`projects`** — `area_id` (cascade), `user_id`, `name`, `description`,
  `status project_status`, `color`, `sort_order`.
- **`tasks`** — `project_id` (cascade), `user_id`, `title`, `content` (markdown),
  `status task_status`, `priority task_priority`, `due_date date NULL`,
  `sort_order`, `completed_at timestamptz NULL`.
- **`notes`** — `user_id`, `title`, `content` (markdown), y tres FK nullable:
  `area_id`, `project_id`, `task_id` (las tres on delete cascade). CHECK
  constraint: exactamente una de las tres llenas.
- **`user_preferences`** — 1:1 con `auth.users`. `theme`, `default_view`,
  `dashboard_layout jsonb`. Reservado para personalización futura.

### Enums
- `project_status`: `active | on_hold | completed | archived`
- `task_status`: `backlog | todo | in_progress | blocked | done`
- `task_priority`: `low | medium | high`

### Índices
- FK indexadas: `areas(user_id)`, `projects(area_id, user_id)`,
  `tasks(project_id, user_id, status, due_date)`,
  `notes(user_id, area_id, project_id, task_id)`.

### Triggers
- `set_updated_at()` aplicado a cada tabla con `updated_at`.
- `handle_new_user()` en `auth.users AFTER INSERT` que crea `profiles` y
  `user_preferences` para el nuevo usuario.

### RLS
RLS habilitado en **todas** las tablas. Política base por tabla con `user_id`:

```sql
USING  (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

Para `profiles` y `user_preferences` la columna comparable es `id` /
`user_id` según corresponda. `notes` se filtra por `user_id` directamente
(no por la entidad padre).

---

## Acceso a datos

- **Lecturas** → React Server Components usando `createClient()` de
  `lib/supabase/server.ts`. RLS aplica automáticamente con la sesión del
  usuario.
- **Mutaciones** → **Server Actions** en `src/lib/actions/*`. Validan input con
  zod, ejecutan la operación contra Supabase, llaman `revalidatePath()` y
  retornan `{ ok: true } | { ok: false, error }`.
- **No** usamos un ORM aparte. La seguridad la da RLS, no la capa de aplicación.
- Tipos del schema en `src/types/database.ts`, regenerados con
  `npx supabase gen types typescript --project-id <id> > src/types/database.ts`.

---

## Autenticación

Flujo elegido: **email/password con confirmación de email**.

- Registro → Supabase envía email → callback `/auth/callback` → sesión activa.
- Mientras el email no esté confirmado, mostrar pantalla "revisá tu casilla".
- Recuperación: `/reset-password` envía email; el link lleva a una página de
  cambio de contraseña.
- Logout: server action que llama `supabase.auth.signOut()` y redirige a
  `/login`.

El `middleware.ts` raíz:
1. Refresca la sesión en cada request (cookie rotation).
2. Si la ruta empieza con `(app)` y no hay sesión → redirect a `/login`.
3. Si el usuario tiene sesión y entra a `/login` o `/register` → redirect a
   `/dashboard`.

---

## Comandos

```bash
npm install
npm run dev          # localhost:3000
npm run build
npm run lint
npm run typecheck    # tsc --noEmit
npm run db:types     # regenera src/types/database.ts (requiere supabase CLI logueado)
```

---

## Variables de entorno

En `.env.local` (nunca committeado):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # solo si hace falta para scripts/admin
```

`.env.example` queda con los mismos nombres y valores vacíos.

---

## Plan de Fase 1 (orden de implementación)

1. **Scaffold** — `create-next-app`, Tailwind v4, shadcn/ui, deps, scripts.
2. **`.gitignore` + `.env.example`** y commit inicial.
3. **Supabase clients + middleware** (auth refresh y route guard).
4. **Migración 1 — schema base** (enums, tablas, FK, índices, triggers, RLS).
5. **Tipos TS generados** (placeholder local; el usuario corre `db:types` con
   sus credenciales).
6. **Auth pages**: login, register, reset-password, callback, logout.
7. **Layouts** (auth, app con sidebar, theme provider, toggle dark/light).
8. **CRUD Áreas** + listado + detalle.
9. **CRUD Proyectos** anidado en área.
10. **CRUD Tareas** + filtro por estado, vista de lista.
11. **Editor/Viewer Markdown** reutilizable.
12. **CRUD Notas** colgando de área/proyecto/tarea.
13. **Dashboard** con contadores reales y tareas próximas a vencer.
14. **Pasada final**: `npm run build`, `npm run typecheck`, ajustes.

Después de cada bloque grande hago un commit y un resumen breve.

---

## Fuera de alcance (Fase 2+)

- Vista kanban con drag-and-drop.
- Vista de calendario.
- Widgets configurables del dashboard.
- Estados de tarea personalizables por proyecto.
- Login social (Google/GitHub).
- Colaboración multiusuario / workspaces compartidos.
- Búsqueda full-text.
- Adjuntos / Supabase Storage.

El código se estructura para permitir agregar estas features sin reescribir la
base, pero no se implementan ahora.

---

## Reglas operativas

- **No** correr migraciones contra la DB con claves inventadas. Si necesito
  credenciales, las pido.
- **No** correr comandos destructivos (drop, reset, borrar datos) sin
  confirmación previa.
- Claves solo en `.env.local`; nunca hardcodeadas ni committeadas.
- Commits chicos con mensajes claros (`feat: ...`, `chore: ...`, `fix: ...`).
- Si algo del spec es ambiguo, paro y pregunto antes de seguir.
