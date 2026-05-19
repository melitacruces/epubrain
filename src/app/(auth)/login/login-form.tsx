'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/auth/submit-button'
import { loginAction, type ActionState } from '@/lib/actions/auth'

export default function LoginForm({
  next,
  initialError,
}: {
  next?: string
  initialError?: string
}) {
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    loginAction,
    initialError === 'auth_callback'
      ? { ok: false, error: 'No pudimos confirmar tu sesión. Probá de nuevo.' }
      : undefined,
  )

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

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
          autoComplete="current-password"
          required
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton className="w-full">Iniciar sesión</SubmitButton>
    </form>
  )
}
