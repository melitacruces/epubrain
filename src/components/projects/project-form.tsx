'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SubmitButton } from '@/components/auth/submit-button'
import { PROJECT_STATUS_OPTIONS } from '@/components/projects/project-status-badge'
import type { ActionResult } from '@/lib/actions/helpers'
import type { ProjectStatus } from '@/types/database'

type FormAction = (
  state: ActionResult | undefined,
  formData: FormData,
) => Promise<ActionResult>

type Initial = {
  name?: string
  description?: string | null
  status?: ProjectStatus
  color?: string | null
}

export function ProjectForm({
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
  const defaultStatus: ProjectStatus = initial?.status ?? 'active'

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initial?.name ?? ''}
          required
          maxLength={120}
          placeholder="Nombre del proyecto"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initial?.description ?? ''}
          maxLength={2000}
          rows={4}
          placeholder="¿Qué incluye este proyecto?"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select name="status" defaultValue={defaultStatus}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            defaultValue={initial?.color ?? ''}
            placeholder="#4f46e5"
          />
        </div>
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
