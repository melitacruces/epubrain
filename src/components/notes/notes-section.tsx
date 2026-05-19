import { createClient } from '@/lib/supabase/server'
import { NewNoteForm } from '@/components/notes/new-note-form'
import { NoteCard } from '@/components/notes/note-card'
import type { NoteScope } from '@/lib/validations/notes'

export async function NotesSection({
  scope,
  title,
}: {
  scope: NoteScope
  title: string
}) {
  const supabase = await createClient()
  let q = supabase
    .from('notes')
    .select('id, title, content, updated_at')

  if (scope.area_id) q = q.eq('area_id', scope.area_id)
  else if (scope.project_id) q = q.eq('project_id', scope.project_id)
  else if (scope.task_id) q = q.eq('task_id', scope.task_id)

  const { data: notes } = await q.order('updated_at', { ascending: false })

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <NewNoteForm scope={scope} />
      </div>

      {notes && notes.length > 0 ? (
        <ul className="grid gap-3">
          {notes.map((n) => (
            <li key={n.id}>
              <NoteCard
                id={n.id}
                initialTitle={n.title}
                initialContent={n.content}
                updatedAt={n.updated_at}
                scope={scope}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No hay notas todavía. Creá la primera con el botón de arriba.
        </p>
      )}
    </section>
  )
}
