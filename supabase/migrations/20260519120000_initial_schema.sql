-- ===========================================================================
-- EpuBrain — esquema inicial (Fase 1)
-- ===========================================================================
-- Crea enums, tablas (profiles, areas, projects, tasks, notes, user_preferences),
-- índices, trigger de updated_at, trigger handle_new_user, y políticas RLS.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.project_status as enum ('active', 'on_hold', 'completed', 'archived');
create type public.task_status   as enum ('backlog', 'todo', 'in_progress', 'blocked', 'done');
create type public.task_priority as enum ('low', 'medium', 'high');

-- ---------------------------------------------------------------------------
-- Función reutilizable para mantener updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 con auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- user_preferences (1:1 con auth.users)
-- ---------------------------------------------------------------------------
create table public.user_preferences (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  theme            text not null default 'system',
  default_view     text not null default 'dashboard',
  dashboard_layout jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- areas
-- ---------------------------------------------------------------------------
create table public.areas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text,
  color       text,
  icon        text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index areas_user_id_idx on public.areas (user_id);

create trigger areas_set_updated_at
  before update on public.areas
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  area_id     uuid not null references public.areas (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text,
  status      public.project_status not null default 'active',
  color       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index projects_area_id_idx on public.projects (area_id);
create index projects_user_id_idx on public.projects (user_id);
create index projects_status_idx  on public.projects (status);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null,
  content      text,
  status       public.task_status   not null default 'todo',
  priority     public.task_priority not null default 'medium',
  due_date     date,
  sort_order   integer not null default 0,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index tasks_project_id_idx on public.tasks (project_id);
create index tasks_user_id_idx    on public.tasks (user_id);
create index tasks_status_idx     on public.tasks (status);
create index tasks_due_date_idx   on public.tasks (due_date);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notes (cuelgan de exactamente una entidad: area, project o task)
-- ---------------------------------------------------------------------------
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text,
  content     text not null,
  area_id     uuid references public.areas    (id) on delete cascade,
  project_id  uuid references public.projects (id) on delete cascade,
  task_id     uuid references public.tasks    (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint notes_exactly_one_parent check (
    (case when area_id    is not null then 1 else 0 end)
    + (case when project_id is not null then 1 else 0 end)
    + (case when task_id    is not null then 1 else 0 end)
    = 1
  )
);

create index notes_user_id_idx    on public.notes (user_id);
create index notes_area_id_idx    on public.notes (area_id)    where area_id    is not null;
create index notes_project_id_idx on public.notes (project_id) where project_id is not null;
create index notes_task_id_idx    on public.notes (task_id)    where task_id    is not null;

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger: crear profile + user_preferences al registrarse un usuario
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));

  insert into public.user_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles         enable row level security;
alter table public.user_preferences enable row level security;
alter table public.areas            enable row level security;
alter table public.projects         enable row level security;
alter table public.tasks            enable row level security;
alter table public.notes            enable row level security;

-- profiles: el usuario gestiona su propia fila
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- el insert lo hace el trigger (security definer); no permitimos insert directo

-- user_preferences
create policy "user_preferences: read own"
  on public.user_preferences for select
  using (auth.uid() = user_id);
create policy "user_preferences: update own"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "user_preferences: insert own"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

-- areas
create policy "areas: read own"
  on public.areas for select using (auth.uid() = user_id);
create policy "areas: insert own"
  on public.areas for insert with check (auth.uid() = user_id);
create policy "areas: update own"
  on public.areas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "areas: delete own"
  on public.areas for delete using (auth.uid() = user_id);

-- projects
create policy "projects: read own"
  on public.projects for select using (auth.uid() = user_id);
create policy "projects: insert own"
  on public.projects for insert with check (auth.uid() = user_id);
create policy "projects: update own"
  on public.projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "projects: delete own"
  on public.projects for delete using (auth.uid() = user_id);

-- tasks
create policy "tasks: read own"
  on public.tasks for select using (auth.uid() = user_id);
create policy "tasks: insert own"
  on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks: update own"
  on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks: delete own"
  on public.tasks for delete using (auth.uid() = user_id);

-- notes
create policy "notes: read own"
  on public.notes for select using (auth.uid() = user_id);
create policy "notes: insert own"
  on public.notes for insert with check (auth.uid() = user_id);
create policy "notes: update own"
  on public.notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes: delete own"
  on public.notes for delete using (auth.uid() = user_id);
