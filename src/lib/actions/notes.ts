'use server'

import { revalidatePath } from 'next/cache'
import { requireUser, type ActionResult } from '@/lib/actions/helpers'
import { noteSchema, noteUpdateSchema, type NoteScope } from '@/lib/validations/notes'

function pathFor(scope: NoteScope) {
  if (scope.area_id) return `/areas/${scope.area_id}`
  if (scope.project_id) return `/projects/${scope.project_id}`
  if (scope.task_id) return `/tasks/${scope.task_id}`
  return '/dashboard'
}

export async function createNoteAction(
  scope: NoteScope,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = noteSchema.safeParse({
    title: formData.get('title') ?? undefined,
    content: formData.get('content'),
    area_id: scope.area_id ?? null,
    project_id: scope.project_id ?? null,
    task_id: scope.task_id ?? null,
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { supabase, user } = await requireUser()
  const { error } = await supabase.from('notes').insert({ ...parsed.data, user_id: user.id })
  if (error) return { ok: false, error: error.message }

  revalidatePath(pathFor(scope))
  return { ok: true }
}

export async function updateNoteAction(
  id: string,
  scope: NoteScope,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = noteUpdateSchema.safeParse({
    title: formData.get('title') ?? undefined,
    content: formData.get('content'),
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { supabase } = await requireUser()
  const { error } = await supabase.from('notes').update(parsed.data).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath(pathFor(scope))
  return { ok: true }
}

export async function deleteNoteAction(id: string, scope: NoteScope): Promise<void> {
  const { supabase } = await requireUser()
  await supabase.from('notes').delete().eq('id', id)
  revalidatePath(pathFor(scope))
}
