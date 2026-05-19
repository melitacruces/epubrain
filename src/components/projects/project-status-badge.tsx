import { Badge } from '@/components/ui/badge'
import type { ProjectStatus } from '@/types/database'

const LABEL: Record<ProjectStatus, string> = {
  active: 'Activo',
  on_hold: 'En pausa',
  completed: 'Completado',
  archived: 'Archivado',
}

const VARIANT: Record<ProjectStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  on_hold: 'secondary',
  completed: 'outline',
  archived: 'outline',
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={VARIANT[status]} className="text-xs">
      {LABEL[status]}
    </Badge>
  )
}

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = (
  Object.keys(LABEL) as ProjectStatus[]
).map((s) => ({ value: s, label: LABEL[s] }))
