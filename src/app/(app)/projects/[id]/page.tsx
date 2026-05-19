import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Pencil, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProjectStatusBadge } from '@/components/projects/project-status-badge'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'
import { ViewToggle } from '@/components/projects/view-toggle'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { TaskList } from '@/components/tasks/task-list'
import { NotesSection } from '@/components/notes/notes-section'
import { getProjectView } from '@/lib/preferences'
import type { KanbanTask } from '@/components/kanban/types'
import { Suspense } from 'react'
import { ProjectDialog } from '@/components/projects/project-dialog'
import { TaskDialog } from '@/components/tasks/task-dialog'
import { updateProjectAction } from '@/lib/actions/projects'
import { createTaskAction } from '@/lib/actions/tasks'

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const sParams = await searchParams
  const isEditOpen = sParams.edit === 'true'
  const isNewTaskOpen = sParams['new-task'] === 'true'

  const supabase = await createClient()
  const [{ data: project }, projectView, { data: rawTasks }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, description, status, color, area_id, areas ( id, name )')
      .eq('id', id)
      .maybeSingle(),
    getProjectView(id),
    supabase
      .from('tasks')
      .select(
        'id, title, status, priority, due_date, completed_at, sort_order, created_at, notes:notes(count)',
      )
      .eq('project_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
  ])

  if (!project) notFound()

  const tasks = (rawTasks ?? []).map((t) => {
    const notesArr = Array.isArray(t.notes) ? t.notes : []
    const notes_count = (notesArr[0]?.count as number | undefined) ?? 0
    return { ...t, notes_count }
  })

  const kanbanTasks: KanbanTask[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    due_date: t.due_date,
    notes_count: t.notes_count,
  }))

  const area = Array.isArray(project.areas) ? project.areas[0] : project.areas

  const updateAction = updateProjectAction.bind(null, project.id)
  const createTAction = createTaskAction.bind(null, project.id)

  return (
    <div className="space-y-8">
      <Link
        href={area ? `/areas/${area.id}` : '/areas'}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> {area?.name ?? 'Áreas'}
      </Link>

      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span 
            className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-2xl shadow-sm border-l-4 mt-0.5 shrink-0" 
            style={{ borderLeftColor: project.color || 'var(--border)' }}
          >
            🚀
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            {project.description ? (
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{project.description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/projects/${project.id}?edit=true`}>
              <Pencil className="size-4" /> Editar
            </Link>
          </Button>
          <DeleteProjectButton id={project.id} areaId={project.area_id} name={project.name} />
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Tareas</h2>
          <div className="flex items-center gap-2">
            <ViewToggle projectId={project.id} current={projectView} />
            <Button asChild size="sm">
              <Link href={`/projects/${project.id}?new-task=true`}>
                <Plus className="size-4" /> Nueva tarea
              </Link>
            </Button>
          </div>
        </div>

        {projectView === 'kanban' ? (
          <KanbanBoard projectId={project.id} initialTasks={kanbanTasks} />
        ) : (
          <TaskList projectId={project.id} initialTasks={tasks} />
        )}
      </section>

      <Suspense fallback={<p className="text-sm text-muted-foreground animate-pulse">Cargando notas...</p>}>
        <NotesSection scope={{ project_id: project.id }} title="Notas del proyecto" />
      </Suspense>

      <ProjectDialog
        open={isEditOpen}
        initial={project}
        action={updateAction}
        cancelHref={`/projects/${project.id}`}
        title="Editar proyecto"
        submitLabel="Guardar cambios"
      />

      <TaskDialog
        open={isNewTaskOpen}
        action={createTAction}
        cancelHref={`/projects/${project.id}`}
        title="Nueva tarea"
        submitLabel="Crear tarea"
      />
    </div>
  )
}
