import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Pencil, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { MarkdownViewer } from '@/components/markdown/markdown-viewer'
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/components/tasks/task-status-badge'
import { TaskCheckbox } from '@/components/tasks/task-checkbox'
import { DeleteTaskButton } from '@/components/tasks/delete-task-button'
import { NotesSection } from '@/components/notes/notes-section'
import { cn } from '@/lib/utils'

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: task } = await supabase
    .from('tasks')
    .select(
      'id, title, content, status, priority, due_date, completed_at, project_id, projects ( id, name, area_id )',
    )
    .eq('id', id)
    .maybeSingle()

  if (!task) notFound()

  const project = Array.isArray(task.projects) ? task.projects[0] : task.projects

  return (
    <div className="space-y-8">
      <Link
        href={project ? `/projects/${project.id}` : '/dashboard'}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> {project?.name ?? 'Volver'}
      </Link>

      <header className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 flex items-start gap-3">
          <div className="pt-1">
            <TaskCheckbox id={task.id} done={task.status === 'done'} />
          </div>
          <div className="min-w-0 flex-1">
            <h1
              className={cn(
                'text-2xl font-semibold tracking-tight break-words',
                task.status === 'done' && 'line-through text-muted-foreground',
              )}
            >
              {task.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              {task.due_date ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <CalendarDays className="size-4" /> Vence {task.due_date}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/tasks/${task.id}/edit`}>
              <Pencil className="size-4" /> Editar
            </Link>
          </Button>
          {project ? (
            <DeleteTaskButton id={task.id} projectId={project.id} title={task.title} />
          ) : null}
        </div>
      </header>

      <section>
        <MarkdownViewer content={task.content} empty="Esta tarea no tiene contenido todavía." />
      </section>

      <NotesSection scope={{ task_id: task.id }} title="Notas de la tarea" />
    </div>
  )
}
