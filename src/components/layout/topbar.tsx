import { createClient } from '@/lib/supabase/server'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/layout/user-menu'

export async function Topbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let displayName: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()
    displayName = profile?.display_name ?? null
  }

  return (
    <header className="flex h-14 items-center justify-end gap-2 px-4 border-b border-border bg-background">
      <ThemeToggle />
      {user ? <UserMenu email={user.email ?? ''} displayName={displayName} /> : null}
    </header>
  )
}
