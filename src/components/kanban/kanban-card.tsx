'use client'

import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays, GripVertical, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskPriorityBadge } from '@/components/tasks/task-status-badge'
import type { KanbanTask } from './types'

export function KanbanCard({ task, isOverlay = false }: { task: KanbanTask; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-md border border-border bg-card p-3 shadow-xs',
        isDragging && !isOverlay && 'opacity-30',
        isOverlay && 'shadow-md ring-1 ring-foreground/15',
      )}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Arrastrar"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <Link
            href={`/tasks/${task.id}`}
            className={cn(
              'block text-sm font-medium leading-snug hover:underline break-words',
              task.status === 'done' && 'line-through text-muted-foreground',
            )}
          >
            {task.title}
          </Link>

          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <TaskPriorityBadge priority={task.priority} />
            {task.due_date ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" /> {task.due_date}
              </span>
            ) : null}
            {task.notes_count > 0 ? (
              <span className="inline-flex items-center gap-1">
                <StickyNote className="size-3" /> {task.notes_count}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
