'use client'

import { useState, useTransition } from 'react'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { MarkdownEditor } from '@/components/markdown/markdown-editor'
import { MarkdownViewer } from '@/components/markdown/markdown-viewer'
import { deleteNoteAction, updateNoteAction } from '@/lib/actions/notes'
import type { NoteScope } from '@/lib/validations/notes'

export function NoteCard({
  id,
  initialTitle,
  initialContent,
  scope,
  updatedAt,
}: {
  id: string
  initialTitle: string | null
  initialContent: string
  scope: NoteScope
  updatedAt: string
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle ?? '')
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState<string>()
  const [pending, start] = useTransition()

  const submit = (formData: FormData) => {
    start(async () => {
      const result = await updateNoteAction(id, scope, undefined, formData)
      if (result.ok) {
        setEditing(false)
        setError(undefined)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {editing ? (
          <form action={submit} className="space-y-3">
            <input type="hidden" name="content" value={content} />

            <div className="space-y-2">
              <Label htmlFor={`note-${id}-title`}>Título</Label>
              <Input
                id={`note-${id}-title`}
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="Título"
              />
            </div>

            <div className="space-y-2">
              <Label>Contenido</Label>
              <MarkdownEditor value={content} onChange={setContent} height={220} />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => {
                  setEditing(false)
                  setTitle(initialTitle ?? '')
                  setContent(initialContent)
                  setError(undefined)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : 'Guardar'}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {initialTitle ? (
                  <h3 className="text-sm font-semibold truncate">{initialTitle}</h3>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Actualizada el {new Date(updatedAt).toLocaleDateString('es')}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                  aria-label="Editar nota"
                >
                  <Pencil className="size-4" />
                </Button>
                <DeleteForm id={id} scope={scope} />
              </div>
            </div>
            <MarkdownViewer content={initialContent} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function DeleteForm({ id, scope }: { id: string; scope: NoteScope }) {
  const action = deleteNoteAction.bind(null, id, scope)
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('¿Borrar esta nota?')) e.preventDefault()
      }}
    >
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-destructive"
        aria-label="Borrar nota"
      >
        <Trash2 className="size-4" />
      </Button>
    </form>
  )
}
