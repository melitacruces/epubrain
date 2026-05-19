'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser, type ActionResult } from '@/lib/actions/helpers'
import { taskSchema, taskUpdateSchema } from '@/lib/validations/tasks'

export async function createTaskAction(
  projectId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = taskSchema.safeParse({
    project_id: projectId,
    title: formData.get('title'),
    content: formData.get('content') ?? undefined,
    status: formData.get('status') ?? undefined,
    priority: formData.get('priority') ?? undefined,
    due_date: formData.get('due_date') ?? undefined,
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { supabase, user } = await requireUser()
  const completed_at = parsed.data.status === 'done' ? new Date().toISOString() : null
  const { error } = await supabase.from('tasks').insert({
    ...parsed.data,
    user_id: user.id,
    completed_at,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  redirect(`/projects/${projectId}`)
}

export async function updateTaskAction(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = taskUpdateSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content') ?? undefined,
    status: formData.get('status') ?? undefined,
    priority: formData.get('priority') ?? undefined,
    due_date: formData.get('due_date') ?? undefined,
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { supabase } = await requireUser()

  // Resolvemos completed_at en función del status nuevo (lookup previo para mantenerlo si no cambia).
  const { data: existing } = await supabase
    .from('tasks')
    .select('status, completed_at, project_id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) return { ok: false, error: 'No encontramos la tarea' }

  let completed_at = existing.completed_at
  if (parsed.data.status === 'done' && existing.status !== 'done') {
    completed_at = new Date().toISOString()
  } else if (parsed.data.status !== 'done' && existing.status === 'done') {
    completed_at = null
  }

  const { error } = await supabase
    .from('tasks')
    .update({ ...parsed.data, completed_at })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/projects/${existing.project_id}`)
  revalidatePath(`/tasks/${id}`)
  revalidatePath('/dashboard')
  redirect(`/tasks/${id}`)
}

// Toggle rápido a "done" / volver a "todo".
export async function toggleTaskDoneAction(id: string): Promise<void> {
  const { supabase } = await requireUser()
  const { data: existing } = await supabase
    .from('tasks')
    .select('status, project_id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) return

  const nextStatus = existing.status === 'done' ? 'todo' : 'done'
  const completed_at = nextStatus === 'done' ? new Date().toISOString() : null

  await supabase
    .from('tasks')
    .update({ status: nextStatus, completed_at })
    .eq('id', id)

  revalidatePath(`/projects/${existing.project_id}`)
  revalidatePath(`/tasks/${id}`)
  revalidatePath('/dashboard')
}

export async function deleteTaskAction(id: string, projectId: string): Promise<void> {
  const { supabase } = await requireUser()
  await supabase.from('tasks').delete().eq('id', id)
  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  redirect(`/projects/${projectId}`)
}
