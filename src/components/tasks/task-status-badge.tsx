import { Badge } from '@/components/ui/badge'
import type { TaskPriority, TaskStatus } from '@/types/database'

const STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Por hacer',
  in_progress: 'En curso',
  blocked: 'Bloqueada',
  done: 'Hecha',
}

const STATUS_VARIANT: Record<TaskStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  backlog: 'outline',
  todo: 'secondary',
  in_progress: 'default',
  blocked: 'destructive',
  done: 'outline',
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="text-xs">
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  if (priority === 'medium') return null
  return (
    <Badge variant={priority === 'high' ? 'destructive' : 'outline'} className="text-xs">
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
