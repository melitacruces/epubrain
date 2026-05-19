'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
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

const PRESETS_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Slate', value: '#64748b' },
]

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
  const [selectedColor, setSelectedColor] = useState(initial?.color ?? PRESETS_COLORS[0].value)
  const defaultStatus: ProjectStatus = initial?.status ?? 'active'

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="color" value={selectedColor} />

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

      <div className="grid md:grid-cols-2 gap-4">
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
          <Label>Color del proyecto</Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                className="size-7 rounded-full border border-border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ backgroundColor: c.value }}
                onClick={() => setSelectedColor(c.value)}
                title={c.name}
              >
                {selectedColor === c.value && (
                  <Check className="size-3.5 text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.5)]" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground shrink-0">Personalizado:</span>
            <Input
              id="color-custom"
              type="text"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="h-7 w-28 text-xs font-mono"
              placeholder="#hex o nombre"
            />
          </div>
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
