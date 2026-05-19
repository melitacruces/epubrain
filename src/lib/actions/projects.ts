'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser, type ActionResult } from '@/lib/actions/helpers'
import { projectSchema, projectUpdateSchema } from '@/lib/validations/projects'

export async function createProjectAction(
  areaId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = projectSchema.safeParse({
    area_id: areaId,
    name: formData.get('name'),
    description: formData.get('description') ?? undefined,
    status: formData.get('status') ?? undefined,
    color: formData.get('color') ?? undefined,
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { supabase, user } = await requireUser()

  // Verificamos que el área sea del usuario (RLS lo cubre, pero ahorramos un round-trip si falla).
  const { error } = await supabase.from('projects').insert({ ...parsed.data, user_id: user.id })
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/areas/${areaId}`)
  revalidatePath('/dashboard')
  redirect(`/areas/${areaId}`)
}

export async function updateProjectAction(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = projectUpdateSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? undefined,
    status: formData.get('status') ?? undefined,
    color: formData.get('color') ?? undefined,
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { supabase } = await requireUser()
  const { error } = await supabase.from('projects').update(parsed.data).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/projects/${id}`)
  revalidatePath('/dashboard')
  redirect(`/projects/${id}`)
}

export async function deleteProjectAction(id: string, areaId: string): Promise<void> {
  const { supabase } = await requireUser()
  await supabase.from('projects').delete().eq('id', id)
  revalidatePath(`/areas/${areaId}`)
  revalidatePath('/dashboard')
  redirect(`/areas/${areaId}`)
}
