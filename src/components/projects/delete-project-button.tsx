'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteProjectAction } from '@/lib/actions/projects'

export function DeleteProjectButton({
  id,
  areaId,
  name,
}: {
  id: string
  areaId: string
  name: string
}) {
  const action = deleteProjectAction.bind(null, id, areaId)
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            `¿Borrar el proyecto "${name}"? Se borrarán también sus tareas y notas.`,
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
