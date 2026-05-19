'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { KanbanCard } from './kanban-card'
import type { KanbanTask } from './types'
import type { TaskStatus } from '@/types/database'

export function KanbanColumn({
  status,
  label,
  tasks,
}: {
  status: TaskStatus
  label: string
  tasks: KanbanTask[]
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${status}`,
    data: { type: 'column', status },
  })

  return (
    <div className="flex flex-col w-72 shrink-0">
      <header className="flex items-center justify-between px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[0.7rem] tabular-nums">
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 rounded-md bg-muted/30 p-2 min-h-32 flex-1 transition-colors',
          isOver && 'bg-muted/70',
        )}
      >
        <SortableContext
          id={`column:${status}`}
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Vacío</p>
        ) : null}
      </div>
    </div>
  )
}
