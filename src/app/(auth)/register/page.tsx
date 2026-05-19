import Link from 'next/link'
import RegisterForm from './register-form'

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Te enviamos un email para confirmar tu cuenta
        </p>
      </div>

      <RegisterForm />

      <p className="text-sm text-center text-muted-foreground">
        ¿Ya tenés cuenta?{' '}
        <Link className="text-foreground hover:underline" href="/login">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
