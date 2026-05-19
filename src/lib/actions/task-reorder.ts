'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/actions/helpers'
import type { TaskStatus } from '@/types/database'
import { TASK_STATUSES } from '@/lib/validations/tasks'

export type TaskReorderUpdate = {
  id: string
  status: TaskStatus
  sort_order: number
}

// Aplica un batch de cambios de status + sort_order (típicamente generado por
// el kanban al soltar una tarjeta). Mantiene completed_at consistente.
export async function reorderTasksAction(
  projectId: string,
  updates: TaskReorderUpdate[],
): Promise<{ ok: boolean; error?: string }> {
  if (updates.length === 0) return { ok: true }

  // Sanitizamos input — los IDs vienen del cliente.
  const sanitized = updates
    .filter(
      (u) =>
        typeof u.id === 'string' &&
        typeof u.sort_order === 'number' &&
        (TASK_STATUSES as readonly string[]).includes(u.status),
    )
    .map((u) => ({ id: u.id, status: u.status, sort_order: Math.round(u.sort_order) }))

  if (sanitized.length === 0) return { ok: false, error: 'Sin cambios válidos' }

  const { supabase } = await requireUser()

  // Necesitamos saber el status previo y completed_at de cada task para decidir
  // si setear/limpiar completed_at en cada update.
  const ids = sanitized.map((u) => u.id)
  const { data: existing } = await supabase
    .from('tasks')
    .select('id, status, completed_at, project_id')
    .in('id', ids)

  if (!existing) return { ok: false, error: 'No pudimos leer las tareas' }

  // Defendemos: todas deben pertenecer al mismo project. RLS ya filtra por
  // user, pero esto evita que un cliente malicioso mueva tareas entre proyectos.
  if (existing.some((t) => t.project_id !== projectId)) {
    return { ok: false, error: 'Las tareas no pertenecen a este proyecto' }
  }

  const now = new Date().toISOString()
  const byId = new Map(existing.map((t) => [t.id, t]))

  const ops = sanitized.map(async (u) => {
    const prev = byId.get(u.id)
    if (!prev) return

    let completed_at = prev.completed_at
    if (u.status === 'done' && prev.status !== 'done') completed_at = now
    else if (u.status !== 'done' && prev.status === 'done') completed_at = null

    await supabase
      .from('tasks')
      .update({ status: u.status, sort_order: u.sort_order, completed_at })
      .eq('id', u.id)
  })

  await Promise.all(ops)

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { ok: true }
}
