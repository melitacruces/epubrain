import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

export default async function AreasPage() {
  const supabase = await createClient()
  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, description, color, icon, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Áreas</h1>
          <p className="text-sm text-muted-foreground">
            Las grandes categorías que organizan tu vida y tu trabajo.
          </p>
        </div>
        <Button asChild>
          <Link href="/areas/new">
            <Plus className="size-4" /> Nueva área
          </Link>
        </Button>
      </header>

      {areas && areas.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <li key={area.id}>
              <Link href={`/areas/${area.id}`} className="block group">
                <Card 
                  className="h-full border-l-4 transition-all group-hover:border-foreground/30 group-hover:shadow-xs"
                  style={{ borderLeftColor: area.color || 'var(--border)' }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2.5 text-base">
                      {area.icon ? (
                        <span className="flex size-8 items-center justify-center rounded-lg bg-muted/60 text-lg shadow-2xs">
                          {area.icon}
                        </span>
                      ) : (
                        <span className="flex size-8 items-center justify-center rounded-lg bg-muted/60 text-base shadow-2xs">
                          📁
                        </span>
                      )}
                      <span className="font-semibold tracking-tight">{area.name}</span>
                    </CardTitle>
                  </CardHeader>
                  {area.description ? (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {area.description}
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-10 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Todavía no creaste ninguna área. Empezá por las categorías más grandes de tu vida.
        </p>
        <Button asChild>
          <Link href="/areas/new">
            <Plus className="size-4" /> Crear mi primera área
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
