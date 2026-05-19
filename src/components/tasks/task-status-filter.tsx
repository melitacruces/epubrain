import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TASK_STATUS_OPTIONS } from '@/components/tasks/task-status-badge'
import type { TaskStatus } from '@/types/database'

export function TaskStatusFilter({
  basePath,
  active,
}: {
  basePath: string
  active: TaskStatus | 'all'
}) {
  const items: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas' },
    ...TASK_STATUS_OPTIONS,
  ]
  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {items.map((it) => {
        const href = it.value === 'all' ? basePath : `${basePath}?status=${it.value}`
        const isActive = it.value === active
        return (
          <Link
            key={it.value}
            href={href}
            className={cn(
              'rounded-md px-3 py-1.5 transition-colors',
              isActive
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {it.label}
          </Link>
        )
      })}
    </nav>
  )
}
