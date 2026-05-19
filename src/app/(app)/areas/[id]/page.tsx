import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteAreaButton } from '@/components/areas/delete-area-button'
import { ProjectStatusBadge } from '@/components/projects/project-status-badge'
import { NotesSection } from '@/components/notes/notes-section'
import { Suspense } from 'react'

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: area }, { data: projects }] = await Promise.all([
    supabase
      .from('areas')
      .select('id, name, description, color, icon')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('projects')
      .select('id, name, description, status, color')
      .eq('area_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
  ])

  if (!area) notFound()


  return (
    <div className="space-y-8">
      <Link
        href="/areas"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Áreas
      </Link>

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <span 
              className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-2xl shadow-sm border-l-4" 
              style={{ borderLeftColor: area.color || 'var(--border)' }}
            >
              {area.icon || '📁'}
            </span>
            {area.name}
          </h1>
          {area.description ? (
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{area.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/areas/${area.id}/edit`}>
              <Pencil className="size-4" /> Editar
            </Link>
          </Button>
          <DeleteAreaButton id={area.id} name={area.name} />
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Proyectos</h2>
          <Button asChild size="sm">
            <Link href={`/areas/${area.id}/projects/new`}>
              <Plus className="size-4" /> Nuevo proyecto
            </Link>
          </Button>
        </div>

        {projects && projects.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}`} className="block group">
                  <Card 
                    className="h-full border-l-4 transition-all group-hover:border-foreground/30 group-hover:shadow-xs"
                    style={{ borderLeftColor: p.color || 'var(--border)' }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between gap-2 text-base">
                        <span className="truncate font-semibold tracking-tight">{p.name}</span>
                        <ProjectStatusBadge status={p.status} />
                      </CardTitle>
                    </CardHeader>
                    {p.description ? (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {p.description}
                        </p>
                      </CardContent>
                    ) : null}
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No hay proyectos en esta área todavía.
            </CardContent>
          </Card>
        )}
      </section>

      <Suspense fallback={<p className="text-sm text-muted-foreground animate-pulse">Cargando notas...</p>}>
        <NotesSection scope={{ area_id: area.id }} title="Notas del área" />
      </Suspense>
    </div>
  )
}
