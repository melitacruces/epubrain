'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/auth/submit-button'
import { registerAction, type ActionState } from '@/lib/actions/auth'

export default function RegisterForm() {
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    registerAction,
    undefined,
  )

  if (state?.ok) {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
        <p className="font-medium">¡Casi listo!</p>
        <p className="mt-1 text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Nombre</Label>
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          required
          placeholder="Cómo querés que te llamemos"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vos@ejemplo.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton className="w-full">Crear cuenta</SubmitButton>
    </form>
  )
}
