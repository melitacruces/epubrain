'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/auth/submit-button'
import type { ActionResult } from '@/lib/actions/helpers'

type FormAction = (
  state: ActionResult | undefined,
  formData: FormData,
) => Promise<ActionResult>

type Initial = {
  name?: string
  description?: string | null
  color?: string | null
  icon?: string | null
}

export function AreaForm({
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

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initial?.name ?? ''}
          required
          maxLength={80}
          placeholder="Finanzas, Salud, Música…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initial?.description ?? ''}
          maxLength={500}
          rows={3}
          placeholder="¿De qué se trata esta área?"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            defaultValue={initial?.color ?? ''}
            placeholder="#4f46e5 o nombre"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="icon">Icono</Label>
          <Input
            id="icon"
            name="icon"
            defaultValue={initial?.icon ?? ''}
            placeholder="emoji o slug"
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
