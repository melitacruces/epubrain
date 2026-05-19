import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TaskForm } from '@/components/tasks/task-form'
import { updateTaskAction } from '@/lib/actions/tasks'

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, content, status, priority, due_date')
    .eq('id', id)
    .maybeSingle()

  if (!task) notFound()

  const action = updateTaskAction.bind(null, task.id)

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href={`/tasks/${task.id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Volver a la tarea
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar tarea</h1>
      </div>
      <TaskForm
        action={action}
        initial={task}
        cancelHref={`/tasks/${task.id}`}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}
