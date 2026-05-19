import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/projects/project-form'
import { createProjectAction } from '@/lib/actions/projects'

export default async function NewProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: area } = await supabase
    .from('areas')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (!area) notFound()

  const action = createProjectAction.bind(null, area.id)

  return (
    <div className="max-w-xl space-y-6">
      <Link
        href={`/areas/${area.id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Volver a {area.name}
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo proyecto</h1>
        <p className="text-sm text-muted-foreground">En el área {area.name}.</p>
      </div>
      <ProjectForm
        action={action}
        cancelHref={`/areas/${area.id}`}
        submitLabel="Crear proyecto"
      />
    </div>
  )
}
