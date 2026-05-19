'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SubmitButton } from '@/components/auth/submit-button'
import { MarkdownEditor } from '@/components/markdown/markdown-editor'
import {
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '@/components/tasks/task-status-badge'
import type { ActionResult } from '@/lib/actions/helpers'
import type { TaskPriority, TaskStatus } from '@/types/database'

type FormAction = (
  state: ActionResult | undefined,
  formData: FormData,
) => Promise<ActionResult>

type Initial = {
  title?: string
  content?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
}

export function TaskForm({
  action,
  initial,
  cancelHref,
  submitLabel,
}: {
  action: FormAction
  initial?: Initial
  cancelHref: string
  submitLabel: string
}) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(action, undefined)
  const [content, setContent] = useState(initial?.content ?? '')

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="content" value={content} />

      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initial?.title ?? ''}
          required
          maxLength={200}
          placeholder="¿Qué hay que hacer?"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select name="status" defaultValue={initial?.status ?? 'todo'}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select name="priority" defaultValue={initial?.priority ?? 'medium'}>
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Vence</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={initial?.due_date ?? ''}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Contenido (Markdown)</Label>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          height={320}
          placeholder="Detalles, notas, checklist…"
        />
      </div>

      {state && !state.ok ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" asChild>
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  )
}
