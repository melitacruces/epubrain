'use server'

import { revalidatePath } from 'next/cache'
import { requireUser, type ActionResult } from '@/lib/actions/helpers'
import { TASK_STATUSES } from '@/lib/validations/tasks'
import type { TaskStatus } from '@/types/database'

export async function bulkUpdateTaskStatusAction(
  projectId: string,
  ids: string[],
  status: TaskStatus,
): Promise<ActionResult> {
  if (ids.length === 0) return { ok: false, error: 'No hay tareas seleccionadas' }
  if (!(TASK_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: 'Estado inválido' }
  }

  const { supabase } = await requireUser()

  // Para mantener completed_at consistente, leemos primero.
  const { data: existing } = await supabase
    .from('tasks')
    .select('id, status, completed_at, project_id')
    .in('id', ids)

  if (!existing) return { ok: false, error: 'No pudimos leer las tareas' }
  if (existing.some((t) => t.project_id !== projectId)) {
    return { ok: false, error: 'Las tareas no pertenecen a este proyecto' }
  }

  const now = new Date().toISOString()
  await Promise.all(
    existing.map(async (t) => {
      let completed_at = t.completed_at
      if (status === 'done' && t.status !== 'done') completed_at = now
      else if (status !== 'done' && t.status === 'done') completed_at = null

      await supabase.from('tasks').update({ status, completed_at }).eq('id', t.id)
    }),
  )

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { ok: true }
}
