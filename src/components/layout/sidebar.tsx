'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderTree } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/areas', label: 'Áreas', icon: FolderTree },
] as const

export function Sidebar({
  areas = [],
}: {
  areas?: { id: string; name: string; color: string | null; icon: string | null }[]
}) {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-border md:bg-sidebar">
      <div className="flex h-14 items-center px-5 border-b border-border">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-primary">
          EpuBrain
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-6">
        <div className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`)) || (href === '/dashboard' && pathname === '/dashboard')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            )
          })}
        </div>

        {areas.length > 0 && (
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mis Áreas
            </h3>
            <div className="space-y-1">
              {areas.map((area) => {
                const href = `/areas/${area.id}`
                const active = pathname === href || pathname.startsWith(`${href}/`)
                return (
                  <Link
                    key={area.id}
                    href={href}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-all',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-base leading-none shrink-0">
                        {area.icon || '📁'}
                      </span>
                      <span className="truncate">{area.name}</span>
                    </span>
                    {area.color && (
                      <span
                        className="size-2 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: area.color }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </aside>
  )
}
