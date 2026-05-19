'use client'

import { useTransition } from 'react'
import { Columns3, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { setProjectViewAction } from '@/lib/actions/preferences'
import type { ProjectView } from '@/lib/preferences'

export function ViewToggle({
  projectId,
  current,
}: {
  projectId: string
  current: ProjectView
}) {
  const [pending, start] = useTransition()

  function setView(view: ProjectView) {
    if (view === current || pending) return
    start(async () => {
      await setProjectViewAction(projectId, view)
    })
  }

  return (
    <div
      className="inline-flex items-center rounded-md border border-border bg-background p-0.5 text-sm"
      role="group"
      aria-label="Vista del proyecto"
    >
      <button
        type="button"
        onClick={() => setView('list')}
        disabled={pending}
        aria-pressed={current === 'list'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors',
          current === 'list'
            ? 'bg-secondary text-secondary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <List className="size-4" /> Lista
      </button>
      <button
        type="button"
        onClick={() => setView('kanban')}
        disabled={pending}
        aria-pressed={current === 'kanban'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors',
          current === 'kanban'
            ? 'bg-secondary text-secondary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Columns3 className="size-4" /> Kanban
      </button>
    </div>
  )
}
