'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteTaskAction } from '@/lib/actions/tasks'

export function DeleteTaskButton({
  id,
  projectId,
  title,
}: {
  id: string
  projectId: string
  title: string
}) {
  const action = deleteTaskAction.bind(null, id, projectId)
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`¿Borrar la tarea "${title}"?`)) e.preventDefault()
      }}
    >
      <Button type="submit" variant="ghost" size="sm" className="text-destructive">
        <Trash2 className="size-4" /> Borrar
      </Button>
    </form>
  )
}
