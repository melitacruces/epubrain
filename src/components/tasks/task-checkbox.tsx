'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleTaskDoneAction } from '@/lib/actions/tasks'

export function TaskCheckbox({
  id,
  done,
  size = 'md',
}: {
  id: string
  done: boolean
  size?: 'sm' | 'md'
}) {
  const action = toggleTaskDoneAction.bind(null, id)
  const dim = size === 'sm' ? 'size-4' : 'size-5'

  return (
    <form action={action} className="inline-flex">
      <button
        type="submit"
        aria-label={done ? 'Marcar como pendiente' : 'Marcar como hecha'}
        className={cn(
          'inline-flex items-center justify-center rounded-md border transition-colors',
          dim,
          done
            ? 'bg-foreground text-background border-foreground'
            : 'border-border text-transparent hover:border-foreground/60',
        )}
      >
        <Check className="size-3" strokeWidth={3} />
      </button>
    </form>
  )
}
