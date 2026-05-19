import type { TaskPriority, TaskStatus } from '@/types/database'

export type KanbanTask = {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  notes_count: number
}

export const KANBAN_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'todo', label: 'Por hacer' },
  { status: 'in_progress', label: 'En curso' },
  { status: 'blocked', label: 'Bloqueada' },
  { status: 'done', label: 'Hecha' },
]
