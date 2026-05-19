import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Pencil, Plus, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProjectStatusBadge } from '@/components/projects/project-status-badge'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/components/tasks/task-status-badge'
import { TaskStatusFilter } from '@/components/tasks/task-status-filter'
import { TaskCheckbox } from '@/components/tasks/task-checkbox'
import { NotesSection } from '@/components/notes/notes-section'
import { TASK_STATUSES } from '@/lib/validations/tasks'
import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/database'

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
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, description, status, color, area_id, areas ( id, name )')
    .eq('id', id)
    .maybeSingle()

  if (!project) notFound()

  let tasksQuery = supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, completed_at, sort_order, created_at')
    .eq('project_id', project.id)

  if (status !== 'all') {
    tasksQuery = tasksQuery.eq('status', status)
  }

  const { data: tasks } = await tasksQuery
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

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
          <Button asChild size="sm">
            <Link href={`/projects/${project.id}/tasks/new`}>
              <Plus className="size-4" /> Nueva tarea
            </Link>
          </Button>
        </div>

        <TaskStatusFilter basePath={`/projects/${project.id}`} active={status} />

        {tasks && tasks.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {tasks.map((t) => (
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
                    <div className="flex items-center gap-2 shrink-0">
                      <TaskPriorityBadge priority={t.priority} />
                      <TaskStatusBadge status={t.status} />
                      {t.due_date ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
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
      </section>

      <NotesSection scope={{ project_id: project.id }} title="Notas del proyecto" />
    </div>
  )
}
