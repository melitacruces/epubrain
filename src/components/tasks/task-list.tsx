'use client'

import Link from 'next/link'
import { useMemo, useOptimistic, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  GripVertical,
  StickyNote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskCheckbox } from '@/components/tasks/task-checkbox'
import {
  TaskPriorityBadge,
  TaskStatusBadge,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from '@/components/tasks/task-status-badge'
import { reorderTasksAction } from '@/lib/actions/task-reorder'
import { bulkUpdateTaskStatusAction } from '@/lib/actions/tasks-bulk'
import { cn } from '@/lib/utils'
import type { TaskPriority, TaskStatus } from '@/types/database'

export type ListTask = {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  notes_count: number
  sort_order: number
}

type DueFilter = 'all' | 'overdue' | 'upcoming' | 'no_date'
type SortKey = 'sort_order' | 'due_date' | 'priority'

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function inDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function TaskList({
  projectId,
  initialTasks,
}: {
  projectId: string
  initialTasks: ListTask[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filterStatus = (searchParams.get('status') ?? 'all') as TaskStatus | 'all'
  const filterPriority = (searchParams.get('priority') ?? 'all') as TaskPriority | 'all'
  const filterDue = (searchParams.get('due') ?? 'all') as DueFilter
  const sort = (searchParams.get('sort') ?? 'sort_order') as SortKey

  function setParam(key: string, value: string | null) {
    const sp = new URLSearchParams(searchParams.toString())
    if (value === null || value === 'all' || (key === 'sort' && value === 'sort_order')) {
      sp.delete(key)
    } else {
      sp.set(key, value)
    }
    const qs = sp.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  // El optimistic state representa el orden visible. Cuando el server revalida
  // y `initialTasks` cambia, el optimistic se resetea al nuevo baseline.
  const [optimisticTasks, applyOptimistic] = useOptimistic(
    initialTasks,
    (_state, nextOrder: ListTask[]) => nextOrder,
  )

  const baseOrdered = sort === 'sort_order' ? optimisticTasks : initialTasks

  const sorted = useMemo(() => {
    const arr = [...baseOrdered]
    if (sort === 'due_date') {
      arr.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return a.due_date.localeCompare(b.due_date)
      })
    } else if (sort === 'priority') {
      arr.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    }
    return arr
  }, [baseOrdered, sort])

  const today = todayStr()
  const in7 = inDays(7)

  const filtered = useMemo(() => {
    return sorted.filter((t) => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false
      if (filterDue === 'overdue') {
        if (!t.due_date || t.due_date >= today || t.status === 'done') return false
      } else if (filterDue === 'upcoming') {
        if (!t.due_date || t.due_date < today || t.due_date > in7) return false
      } else if (filterDue === 'no_date') {
        if (t.due_date) return false
      }
      return true
    })
  }, [sorted, filterStatus, filterPriority, filterDue, today, in7])

  const activeTasks = filtered.filter((t) => t.status !== 'done')
  const doneTasks = filtered.filter((t) => t.status === 'done')

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [doneOpen, setDoneOpen] = useState(false)
  const [pending, start] = useTransition()

  const dndEnabled = sort === 'sort_order'

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllVisible() {
    setSelected(new Set(filtered.map((t) => t.id)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    if (!dndEnabled) return

    const ids = optimisticTasks.map((t) => t.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return

    const next = arrayMove(optimisticTasks, oldIndex, newIndex)
    const updates = next.map((t, idx) => ({ id: t.id, status: t.status, sort_order: idx }))

    start(async () => {
      applyOptimistic(next)
      const result = await reorderTasksAction(projectId, updates)
      if (!result.ok) toast.error(result.error ?? 'No pudimos guardar el orden')
    })
  }

  function bulkChange(status: TaskStatus) {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    start(async () => {
      const result = await bulkUpdateTaskStatusAction(projectId, ids, status)
      if (result.ok) {
        toast.success(`${ids.length} tarea(s) actualizada(s)`)
        clearSelection()
      } else {
        toast.error(result.error ?? 'No pudimos actualizar')
      }
    })
  }

  if (initialTasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No hay tareas en este proyecto todavía.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <FilterSelect
          label="Estado"
          value={filterStatus}
          onChange={(v) => setParam('status', v)}
          options={[{ value: 'all', label: 'Todos' }, ...TASK_STATUS_OPTIONS]}
        />
        <FilterSelect
          label="Prioridad"
          value={filterPriority}
          onChange={(v) => setParam('priority', v)}
          options={[{ value: 'all', label: 'Todas' }, ...TASK_PRIORITY_OPTIONS]}
        />
        <FilterSelect
          label="Vencimiento"
          value={filterDue}
          onChange={(v) => setParam('due', v)}
          options={[
            { value: 'all', label: 'Todas' },
            { value: 'overdue', label: 'Vencidas' },
            { value: 'upcoming', label: 'Próx. 7 días' },
            { value: 'no_date', label: 'Sin fecha' },
          ]}
        />
        <FilterSelect
          label="Ordenar"
          value={sort}
          onChange={(v) => setParam('sort', v)}
          options={[
            { value: 'sort_order', label: 'Manual' },
            { value: 'due_date', label: 'Fecha límite' },
            { value: 'priority', label: 'Prioridad' },
          ]}
        />
        {filtered.length !== initialTasks.length ? (
          <span className="text-xs text-muted-foreground">
            {filtered.length} de {initialTasks.length}
          </span>
        ) : null}
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
          <span className="font-medium">{selected.size} seleccionada(s)</span>
          <Select onValueChange={(v) => bulkChange(v as TaskStatus)} value="" disabled={pending}>
            <SelectTrigger size="sm" className="h-7 min-w-40">
              <SelectValue placeholder="Cambiar estado a…" />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" onClick={clearSelection} disabled={pending}>
            Limpiar
          </Button>
        </div>
      ) : filtered.length > 0 ? (
        <div className="text-xs text-muted-foreground">
          <button
            type="button"
            className="hover:text-foreground hover:underline"
            onClick={selectAllVisible}
          >
            Seleccionar todas las visibles
          </button>
        </div>
      ) : null}

      {activeTasks.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={activeTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="divide-y divide-border">
                  {activeTasks.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      selected={selected.has(t.id)}
                      onToggleSelected={() => toggleSelected(t.id)}
                      dndEnabled={dndEnabled}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      ) : null}

      {doneTasks.length > 0 ? (
        <div className="rounded-md border border-border">
          <button
            type="button"
            onClick={() => setDoneOpen((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              {doneOpen ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              Hechas ({doneTasks.length})
            </span>
          </button>
          {doneOpen ? (
            <ul className="divide-y divide-border border-t border-border">
              {doneTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  selected={selected.has(t.id)}
                  onToggleSelected={() => toggleSelected(t.id)}
                  dndEnabled={false}
                />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No hay tareas que coincidan con los filtros.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T | string; label: string }[]
}) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger size="sm" className="h-7 min-w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

function TaskRow({
  task,
  selected,
  onToggleSelected,
  dndEnabled,
}: {
  task: ListTask
  selected: boolean
  onToggleSelected: () => void
  dndEnabled: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !dndEnabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 px-3 py-2',
        isDragging && 'opacity-50',
        selected && 'bg-muted/50',
      )}
    >
      {dndEnabled ? (
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground"
          aria-label="Arrastrar"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      ) : (
        <span className="w-4" />
      )}

      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelected}
        aria-label="Seleccionar tarea"
        className="size-4 accent-foreground"
      />

      <TaskCheckbox id={task.id} done={task.status === 'done'} size="sm" />

      <Link
        href={`/tasks/${task.id}`}
        className={cn(
          'flex-1 truncate text-sm font-medium hover:underline',
          task.status === 'done' && 'line-through text-muted-foreground',
        )}
      >
        {task.title}
      </Link>

      <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
        <TaskPriorityBadge priority={task.priority} />
        <TaskStatusBadge status={task.status} />
        {task.notes_count > 0 ? (
          <span className="inline-flex items-center gap-1">
            <StickyNote className="size-3" /> {task.notes_count}
          </span>
        ) : null}
        {task.due_date ? (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" /> {task.due_date}
          </span>
        ) : null}
      </div>
    </li>
  )
}
