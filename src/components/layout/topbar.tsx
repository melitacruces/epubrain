import { getAuthenticatedUser, getUserProfile } from '@/lib/supabase/server'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/layout/user-menu'

export async function Topbar() {
  const user = await getAuthenticatedUser()

  let displayName: string | null = null
  if (user) {
    const profile = await getUserProfile(user.id)
    displayName = profile?.display_name ?? null
  }


  return (
    <header className="flex h-14 items-center justify-end gap-2 px-4 border-b border-border bg-background">
      <ThemeToggle />
      {user ? <UserMenu email={user.email ?? ''} displayName={displayName} /> : null}
    </header>
  )
}
