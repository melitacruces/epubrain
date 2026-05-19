import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TaskForm } from '@/components/tasks/task-form'
import { createTaskAction } from '@/lib/actions/tasks'

export default async function NewTaskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (!project) notFound()

  const action = createTaskAction.bind(null, project.id)

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href={`/projects/${project.id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Volver al proyecto
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva tarea</h1>
        <p className="text-sm text-muted-foreground">En el proyecto {project.name}.</p>
      </div>
      <TaskForm action={action} cancelHref={`/projects/${project.id}`} submitLabel="Crear tarea" />
    </div>
  )
}
