import 'server-only'
import { createClient } from '@/lib/supabase/server'

// Estructura libre que vivimos en `user_preferences.dashboard_layout` jsonb.
// Por ahora solo guardamos la preferencia de vista por proyecto (kanban / list).
export type ProjectView = 'list' | 'kanban'

export type DashboardLayoutPrefs = {
  projectView?: Record<string, ProjectView>
}

export async function getProjectView(projectId: string): Promise<ProjectView> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'list'

  const { data } = await supabase
    .from('user_preferences')
    .select('dashboard_layout')
    .eq('user_id', user.id)
    .maybeSingle()

  const prefs = (data?.dashboard_layout ?? {}) as DashboardLayoutPrefs
  const stored = prefs.projectView?.[projectId]
  return stored === 'kanban' ? 'kanban' : 'list'
}
