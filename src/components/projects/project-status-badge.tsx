import { Badge } from '@/components/ui/badge'
import type { ProjectStatus } from '@/types/database'

const LABEL: Record<ProjectStatus, string> = {
  active: 'Activo',
  on_hold: 'En pausa',
  completed: 'Completado',
  archived: 'Archivado',
}

const CLASSES: Record<ProjectStatus, string> = {
  active: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/25 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
  on_hold: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  archived: 'bg-slate-500/10 text-slate-700 border-slate-500/25 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30',
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-semibold border ${CLASSES[status]}`}>
      {LABEL[status]}
    </Badge>
  )
}

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = (
  Object.keys(LABEL) as ProjectStatus[]
).map((s) => ({ value: s, label: LABEL[s] }))
