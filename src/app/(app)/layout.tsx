import { redirect } from 'next/navigation'
import { createClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, color, icon')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <div className="flex min-h-svh">
      <Sidebar areas={areas ?? []} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
