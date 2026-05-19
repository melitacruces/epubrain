import Link from 'next/link'
import ResetPasswordForm from './reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Te mandamos un link para cambiarla
        </p>
      </div>

      <ResetPasswordForm />

      <p className="text-sm text-center text-muted-foreground">
        <Link className="text-foreground hover:underline" href="/login">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  )
}
