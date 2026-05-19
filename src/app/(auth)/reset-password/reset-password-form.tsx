'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/auth/submit-button'
import { resetPasswordAction, type ActionState } from '@/lib/actions/auth'

export default function ResetPasswordForm() {
  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    resetPasswordAction,
    undefined,
  )

  if (state?.ok) {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
        <p className="text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
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

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton className="w-full">Enviar link</SubmitButton>
    </form>
  )
}
