'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MarkdownEditor } from '@/components/markdown/markdown-editor'
import { createNoteAction } from '@/lib/actions/notes'
import type { NoteScope } from '@/lib/validations/notes'
import { Loader2, Plus } from 'lucide-react'

export function NewNoteForm({ scope }: { scope: NoteScope }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string>()
  const [pending, start] = useTransition()

  function reset() {
    setContent('')
    setTitle('')
    setError(undefined)
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Nueva nota
      </Button>
    )
  }

  const submit = (formData: FormData) => {
    start(async () => {
      const result = await createNoteAction(scope, undefined, formData)
      if (result.ok) {
        reset()
        setOpen(false)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form action={submit} className="space-y-3 rounded-md border border-border p-4">
      <input type="hidden" name="content" value={content} />

      <div className="space-y-2">
        <Label htmlFor="note-title">Título (opcional)</Label>
        <Input
          id="note-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Título de la nota"
        />
      </div>

      <div className="space-y-2">
        <Label>Contenido</Label>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          height={220}
          placeholder="Escribí en Markdown…"
        />
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
          onClick={() => {
            reset()
            setOpen(false)
          }}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : 'Guardar nota'}
        </Button>
      </div>
    </form>
  )
}
