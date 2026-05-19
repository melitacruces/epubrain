# EpuBrain

"Segundo cerebro" personal para organizar áreas de la vida (finanzas, salud,
música, dev, etc.). Cada **área** contiene **proyectos**, cada proyecto
contiene **tareas**, y se pueden adjuntar **notas** en Markdown a cualquier
nivel.

Construido con Next.js 16 (App Router), TypeScript estricto, Tailwind v4,
shadcn/ui y Supabase (Postgres + Auth + RLS).

> Para detalles de arquitectura y convenciones, ver [`CLAUDE.md`](./CLAUDE.md).

---

## Requisitos

- Node.js 20 o superior
- npm 10+
- Una cuenta de Supabase (plan gratuito alcanza) con un proyecto creado

---

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear el proyecto de Supabase

1. Entrá a [supabase.com/dashboard](https://supabase.com/dashboard) y creá un
   proyecto nuevo.
2. En **Project Settings → API**, copiá:
   - `Project URL`
   - `anon public` key

### 3. Variables de entorno

Copiá el ejemplo y completá con los valores del paso 2:

```bash
cp .env.example .env.local
```

Editá `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

`.env.local` está en `.gitignore`; **no la committees**.

### 4. Aplicar las migraciones

El esquema vive en `supabase/migrations/`. Para aplicarlo en tu proyecto cloud
tenés dos opciones:

**Opción A — Dashboard de Supabase (más simple):**

1. Abrí el SQL editor de tu proyecto.
2. Copiá el contenido de `supabase/migrations/20260519120000_initial_schema.sql`.
3. Ejecutalo.

**Opción B — Supabase CLI:**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

### 5. Configurar el email de confirmación

En el dashboard de Supabase → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: agregá `http://localhost:3000/auth/callback`

En **Authentication → Providers → Email** dejá activado *Confirm email*.

### 6. (Opcional) Regenerar tipos de TypeScript

Si modificás el esquema, regenerá los tipos:

```bash
npx supabase gen types typescript --project-id <PROJECT_REF> --schema public > src/types/database.ts
```

---

## Comandos

```bash
npm run dev        # servidor de desarrollo en http://localhost:3000
npm run build      # build de producción
npm run start      # ejecuta el build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

---

## Estructura

```
src/
  app/
    (auth)/        # login, register, reset-password
    (app)/         # rutas protegidas: dashboard, areas, projects, tasks
  components/      # ui (shadcn) y componentes propios
  lib/
    supabase/      # clients server/browser/middleware
    actions/       # server actions por entidad
    validations/   # esquemas zod
  types/database.ts
supabase/migrations/
middleware.ts
```
