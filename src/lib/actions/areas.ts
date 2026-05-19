'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser, type ActionResult } from '@/lib/actions/helpers'
import { areaSchema } from '@/lib/validations/areas'

function parse(formData: FormData) {
  return areaSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? undefined,
    color: formData.get('color') ?? undefined,
    icon: formData.get('icon') ?? undefined,
  })
}

export async function createAreaAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parse(formData)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { supabase, user } = await requireUser()
  const { error } = await supabase.from('areas').insert({ ...parsed.data, user_id: user.id })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/areas')
  revalidatePath('/dashboard')
  redirect('/areas')
}

export async function updateAreaAction(
  id: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parse(formData)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { supabase } = await requireUser()
  const { error } = await supabase.from('areas').update(parsed.data).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/areas')
  revalidatePath(`/areas/${id}`)
  redirect(`/areas/${id}`)
}

export async function deleteAreaAction(id: string): Promise<void> {
  const { supabase } = await requireUser()
  await supabase.from('areas').delete().eq('id', id)
  revalidatePath('/areas')
  revalidatePath('/dashboard')
  redirect('/areas')
}
