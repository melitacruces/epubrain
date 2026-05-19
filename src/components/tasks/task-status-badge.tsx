import { Badge } from '@/components/ui/badge'
import type { TaskPriority, TaskStatus } from '@/types/database'

const STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Por hacer',
  in_progress: 'En curso',
  blocked: 'Bloqueada',
  done: 'Hecha',
}

const STATUS_CLASSES: Record<TaskStatus, string> = {
  backlog: 'bg-sky-500/10 text-sky-700 border-sky-500/25 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30',
  todo: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  in_progress: 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  blocked: 'bg-red-500/10 text-red-700 border-red-500/25 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
  done: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
}

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  low: 'bg-slate-500/10 text-slate-700 border-slate-500/25 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30',
  medium: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  high: 'bg-rose-500/10 text-rose-700 border-rose-500/25 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 font-semibold',
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-semibold border ${STATUS_CLASSES[status]}`}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  if (priority === 'medium') return null
  return (
    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider border ${PRIORITY_CLASSES[priority]}`}>
      {PRIORITY_LABEL[priority]}
    </Badge>
  )
}

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = (
  Object.keys(STATUS_LABEL) as TaskStatus[]
).map((s) => ({ value: s, label: STATUS_LABEL[s] }))

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = (
  Object.keys(PRIORITY_LABEL) as TaskPriority[]
).map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))
