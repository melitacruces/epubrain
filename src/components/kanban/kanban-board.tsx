'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { KANBAN_COLUMNS, type KanbanTask } from './types'
import { KanbanCard } from './kanban-card'
import { KanbanColumn } from './kanban-column'
import { reorderTasksAction, type TaskReorderUpdate } from '@/lib/actions/task-reorder'
import { toast } from 'sonner'
import type { TaskStatus } from '@/types/database'

type Grouped = Record<TaskStatus, KanbanTask[]>

function groupTasks(tasks: KanbanTask[]): Grouped {
  const empty: Grouped = {
    backlog: [],
    todo: [],
    in_progress: [],
    blocked: [],
    done: [],
  }
  for (const task of tasks) empty[task.status].push(task)
  return empty
}

function columnIdToStatus(id: string | undefined): TaskStatus | null {
  if (!id) return null
  if (id.startsWith('column:')) return id.slice('column:'.length) as TaskStatus
  return null
}

export function KanbanBoard({
  projectId,
  initialTasks,
}: {
  projectId: string
  initialTasks: KanbanTask[]
}) {
  const [grouped, setGrouped] = useState<Grouped>(() => groupTasks(initialTasks))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeTask = useMemo(() => {
    if (!activeId) return null
    for (const status of Object.keys(grouped) as TaskStatus[]) {
      const t = grouped[status].find((x) => x.id === activeId)
      if (t) return t
    }
    return null
  }, [activeId, grouped])

  function findContainer(id: string): TaskStatus | null {
    const colStatus = columnIdToStatus(id)
    if (colStatus) return colStatus
    for (const status of Object.keys(grouped) as TaskStatus[]) {
      if (grouped[status].some((t) => t.id === id)) return status
    }
    return null
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeContainer = findContainer(String(active.id))
    const overContainer = findContainer(String(over.id))
    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    setGrouped((prev) => {
      const activeItems = prev[activeContainer]
      const overItems = prev[overContainer]
      const activeIndex = activeItems.findIndex((t) => t.id === active.id)
      if (activeIndex < 0) return prev

      const overIndex = overItems.findIndex((t) => t.id === over.id)
      const insertAt = overIndex >= 0 ? overIndex : overItems.length
      const moved = { ...activeItems[activeIndex], status: overContainer }

      return {
        ...prev,
        [activeContainer]: activeItems.filter((t) => t.id !== active.id),
        [overContainer]: [
          ...overItems.slice(0, insertAt),
          moved,
          ...overItems.slice(insertAt),
        ],
      }
    })
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const activeContainer = findContainer(String(active.id))
    const overContainer = findContainer(String(over.id))
    if (!activeContainer || !overContainer) return

    let nextGrouped: Grouped | null = null

    if (activeContainer === overContainer) {
      const items = grouped[activeContainer]
      const oldIndex = items.findIndex((t) => t.id === active.id)
      const newIndex = items.findIndex((t) => t.id === over.id)
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return
      nextGrouped = { ...grouped, [activeContainer]: arrayMove(items, oldIndex, newIndex) }
      setGrouped(nextGrouped)
    }

    const current = nextGrouped ?? grouped
    const touched = new Set<TaskStatus>([activeContainer, overContainer])

    const updates: TaskReorderUpdate[] = []
    for (const status of touched) {
      current[status].forEach((task, idx) => {
        updates.push({ id: task.id, status, sort_order: idx })
      })
    }

    startTransition(async () => {
      const result = await reorderTasksAction(projectId, updates)
      if (!result.ok) {
        toast.error(result.error ?? 'No pudimos guardar el cambio')
        setGrouped(groupTasks(initialTasks))
      }
    })
  }

  function onDragCancel() {
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={grouped[col.status]}
          />
        ))}
      </div>

      <DragOverlay>{activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}</DragOverlay>
    </DndContext>
  )
}
