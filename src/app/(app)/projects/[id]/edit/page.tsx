import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/projects/project-form'
import { updateProjectAction } from '@/lib/actions/projects'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, description, status, color')
    .eq('id', id)
    .maybeSingle()

  if (!project) notFound()

  const action = updateProjectAction.bind(null, project.id)

  return (
    <div className="max-w-xl space-y-6">
      <Link
        href={`/projects/${project.id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Volver al proyecto
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar proyecto</h1>
      </div>
      <ProjectForm
        action={action}
        initial={project}
        cancelHref={`/projects/${project.id}`}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}
