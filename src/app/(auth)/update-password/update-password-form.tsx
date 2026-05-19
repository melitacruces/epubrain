'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/auth/submit-button'
import { updatePasswordAction, type ActionState } from '@/lib/actions/auth'

export default function UpdatePasswordForm() {
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    updatePasswordAction,
    undefined,
  )

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nueva contraseña</Label>
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

      <SubmitButton className="w-full">Cambiar contraseña</SubmitButton>
    </form>
  )
}
