import 'server-only'
import { cache } from 'react'
import { createClient, getAuthenticatedUser } from '@/lib/supabase/server'

// Estructura libre que vivimos en `user_preferences.dashboard_layout` jsonb.
// Por ahora solo guardamos la preferencia de vista por proyecto (kanban / list).
export type ProjectView = 'list' | 'kanban'

export type DashboardLayoutPrefs = {
  projectView?: Record<string, ProjectView>
}

export const getUserPreferences = cache(async (): Promise<DashboardLayoutPrefs> => {
  const user = await getAuthenticatedUser()
  if (!user) return {}

  const supabase = await createClient()
  const { data } = await supabase
    .from('user_preferences')
    .select('dashboard_layout')
    .eq('user_id', user.id)
    .maybeSingle()

  return (data?.dashboard_layout ?? {}) as DashboardLayoutPrefs
})

export async function getProjectView(projectId: string): Promise<ProjectView> {
  const prefs = await getUserPreferences()
  const stored = prefs.projectView?.[projectId]
  return stored === 'kanban' ? 'kanban' : 'list'
}

