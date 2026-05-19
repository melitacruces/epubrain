import Link from 'next/link'
import LoginForm from './login-form'

type SearchParams = Promise<{ next?: string; error?: string }>

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground">Entrá con tu email y contraseña</p>
      </div>

      <LoginForm next={params.next} initialError={params.error} />

      <div className="flex justify-between text-sm">
        <Link className="text-muted-foreground hover:text-foreground" href="/reset-password">
          Olvidé mi contraseña
        </Link>
        <Link className="text-muted-foreground hover:text-foreground" href="/register">
          Crear cuenta
        </Link>
      </div>
    </div>
  )
}
