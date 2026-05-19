import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { AreaForm } from '@/components/areas/area-form'
import { createAreaAction } from '@/lib/actions/areas'

export default function NewAreaPage() {
  return (
    <div className="max-w-xl space-y-6">
      <Link
        href="/areas"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Volver a áreas
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva área</h1>
        <p className="text-sm text-muted-foreground">
          Las áreas agrupan proyectos. Ejemplos: Finanzas, Salud, Música, Dev.
        </p>
      </div>
      <AreaForm action={createAreaAction} cancelHref="/areas" submitLabel="Crear área" />
    </div>
  )
}
