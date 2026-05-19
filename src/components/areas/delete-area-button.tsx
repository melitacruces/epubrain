'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteAreaAction } from '@/lib/actions/areas'

export function DeleteAreaButton({ id, name }: { id: string; name: string }) {
  const action = deleteAreaAction.bind(null, id)

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            `¿Borrar el área "${name}"? Se borrarán también sus proyectos, tareas y notas.`,
          )
        ) {
          e.preventDefault()
        }
      }}
    >
      <Button type="submit" variant="ghost" size="sm" className="text-destructive">
        <Trash2 className="size-4" /> Borrar
      </Button>
    </form>
  )
}
