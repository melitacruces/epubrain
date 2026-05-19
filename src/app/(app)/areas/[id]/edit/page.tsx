import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AreaForm } from '@/components/areas/area-form'
import { updateAreaAction } from '@/lib/actions/areas'

export default async function EditAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: area } = await supabase
    .from('areas')
    .select('id, name, description, color, icon')
    .eq('id', id)
    .maybeSingle()

  if (!area) notFound()

  const action = updateAreaAction.bind(null, area.id)

  return (
    <div className="max-w-xl space-y-6">
      <Link
        href={`/areas/${area.id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Volver al área
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar área</h1>
      </div>
      <AreaForm
        action={action}
        initial={area}
        cancelHref={`/areas/${area.id}`}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}
