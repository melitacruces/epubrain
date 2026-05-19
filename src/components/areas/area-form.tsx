'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
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

const PRESETS_ICONS = ['💼', '📚', '🏡', '🍎', '🎵', '💻', '🧠', '💸', '🏋️', '🎨', '✈️', '⚙️']

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
  const [selectedColor, setSelectedColor] = useState(initial?.color ?? PRESETS_COLORS[0].value)
  const [selectedIcon, setSelectedIcon] = useState(initial?.icon ?? PRESETS_ICONS[0])

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="color" value={selectedColor} />
      <input type="hidden" name="icon" value={selectedIcon} />

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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Color del área</Label>
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

        <div className="space-y-2">
          <Label>Icono del área</Label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`size-7 text-base rounded-md border flex items-center justify-center cursor-pointer transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring ${
                  selectedIcon === emoji
                    ? 'border-primary bg-primary/10 scale-105 shadow-sm'
                    : 'border-border bg-background'
                }`}
                onClick={() => setSelectedIcon(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground shrink-0">Otro emoji:</span>
            <Input
              id="icon-custom"
              type="text"
              value={selectedIcon}
              onChange={(e) => setSelectedIcon(e.target.value)}
              className="h-7 w-12 text-center text-xs"
              maxLength={2}
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
