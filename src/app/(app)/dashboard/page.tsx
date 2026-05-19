import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const TODAY = () => new Date().toISOString().slice(0, 10)

function daysFromNow(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = TODAY()
  const in7 = daysFromNow(7)

  const [
    { count: areasCount },
    { count: projectsActive },
    { count: tasksTodo },
    { count: tasksInProgress },
    { count: tasksDone },
    { data: upcoming },
  ] = await Promise.all([
    supabase.from('areas').select('id', { count: 'exact', head: true }),
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'todo'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'in_progress'),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'done'),
    supabase
      .from('tasks')
      .select('id, title, due_date, status, project_id')
      .gte('due_date', today)
      .lte('due_date', in7)
      .not('status', 'eq', 'done')
      .order('due_date', { ascending: true })
      .limit(8),
  ])

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tu segundo cerebro de un vistazo.</p>
        </div>
        <Button asChild>
          <Link href="/areas">
            <Plus className="size-4" /> Nueva área
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Áreas" value={areasCount ?? 0} />
        <StatCard label="Proyectos activos" value={projectsActive ?? 0} />
        <StatCard label="Tareas pendientes" value={(tasksTodo ?? 0) + (tasksInProgress ?? 0)} />
        <StatCard label="Tareas hechas" value={tasksDone ?? 0} />
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Vencen esta semana</h2>
        <Card>
          <CardContent className="p-0">
            {upcoming && upcoming.length > 0 ? (
              <ul className="divide-y divide-border">
                {upcoming.map((t) => (
                  <li key={t.id} className="flex items-center justify-between px-4 py-3">
                    <Link
                      href={`/tasks/${t.id}`}
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {t.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">{t.due_date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No tenés tareas con vencimiento en los próximos 7 días.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
