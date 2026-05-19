import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Pencil, Plus, CalendarDays, StickyNote } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProjectStatusBadge } from '@/components/projects/project-status-badge'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'
import { ViewToggle } from '@/components/projects/view-toggle'
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/components/tasks/task-status-badge'
import { TaskStatusFilter } from '@/components/tasks/task-status-filter'
import { TaskCheckbox } from '@/components/tasks/task-checkbox'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { NotesSection } from '@/components/notes/notes-section'
import { TASK_STATUSES } from '@/lib/validations/tasks'
import { getProjectView } from '@/lib/preferences'
import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/database'
import type { KanbanTask } from '@/components/kanban/types'

type SearchParams = Promise<{ status?: string }>

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  const { id } = await params
  const { status: rawStatus } = await searchParams
  const status: TaskStatus | 'all' = (TASK_STATUSES as readonly string[]).includes(
    rawStatus ?? '',
  )
    ? (rawStatus as TaskStatus)
    : 'all'

  const supabase = await createClient()
  const [{ data: project }, projectView] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, description, status, color, area_id, areas ( id, name )')
      .eq('id', id)
      .maybeSingle(),
    getProjectView(id),
  ])

  if (!project) notFound()

  // Para ambas vistas traemos todas las tareas con su conteo de notas; el
  // filtro por estado en la vista lista se aplica acá si corresponde.
  const allTasksQuery = supabase
    .from('tasks')
    .select(
      'id, title, status, priority, due_date, completed_at, sort_order, created_at, notes:notes(count)',
    )
    .eq('project_id', project.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  const { data: rawTasks } = await allTasksQuery

  const tasks = (rawTasks ?? []).map((t) => {
    const notesArr = Array.isArray(t.notes) ? t.notes : []
    const notes_count = (notesArr[0]?.count as number | undefined) ?? 0
    return { ...t, notes_count }
  })

  const visibleTasks =
    projectView === 'list' && status !== 'all' ? tasks.filter((t) => t.status === status) : tasks

  const kanbanTasks: KanbanTask[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    due_date: t.due_date,
    notes_count: t.notes_count,
  }))

  const area = Array.isArray(project.areas) ? project.areas[0] : project.areas

  return (
    <div className="space-y-8">
      <Link
        href={area ? `/areas/${area.id}` : '/areas'}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> {area?.name ?? 'Áreas'}
      </Link>

      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description ? (
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{project.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/projects/${project.id}/edit`}>
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
              <Link href={`/projects/${project.id}/tasks/new`}>
                <Plus className="size-4" /> Nueva tarea
              </Link>
            </Button>
          </div>
        </div>

        {projectView === 'kanban' ? (
          <KanbanBoard projectId={project.id} initialTasks={kanbanTasks} />
        ) : (
          <>
            <TaskStatusFilter basePath={`/projects/${project.id}`} active={status} />

            {visibleTasks.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {visibleTasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                        <TaskCheckbox id={t.id} done={t.status === 'done'} />
                        <Link
                          href={`/tasks/${t.id}`}
                          className={cn(
                            'flex-1 truncate text-sm font-medium hover:underline',
                            t.status === 'done' && 'line-through text-muted-foreground',
                          )}
                        >
                          {t.title}
                        </Link>
                        <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                          <TaskPriorityBadge priority={t.priority} />
                          <TaskStatusBadge status={t.status} />
                          {t.notes_count > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <StickyNote className="size-3" /> {t.notes_count}
                            </span>
                          ) : null}
                          {t.due_date ? (
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="size-3" /> {t.due_date}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  {status === 'all'
                    ? 'No hay tareas en este proyecto todavía.'
                    : 'No hay tareas con ese estado.'}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </section>

      <NotesSection scope={{ project_id: project.id }} title="Notas del proyecto" />
    </div>
  )
}
