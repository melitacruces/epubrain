'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/actions/helpers'
import type { DashboardLayoutPrefs, ProjectView } from '@/lib/preferences'

export async function setProjectViewAction(projectId: string, view: ProjectView): Promise<void> {
  const { supabase, user } = await requireUser()

  const { data: existing } = await supabase
    .from('user_preferences')
    .select('dashboard_layout')
    .eq('user_id', user.id)
    .maybeSingle()

  const prefs = ((existing?.dashboard_layout as DashboardLayoutPrefs | null) ?? {}) as DashboardLayoutPrefs
  const projectView = { ...(prefs.projectView ?? {}), [projectId]: view }

  // upsert para cubrir el caso (raro) en el que el trigger handle_new_user no
  // haya creado la fila.
  await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, dashboard_layout: { ...prefs, projectView } }, { onConflict: 'user_id' })

  revalidatePath(`/projects/${projectId}`)
}
