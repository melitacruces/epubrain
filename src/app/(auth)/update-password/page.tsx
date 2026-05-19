import UpdatePasswordForm from './update-password-form'

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Nueva contraseña</h1>
        <p className="text-sm text-muted-foreground">Elegí una contraseña nueva</p>
      </div>
      <UpdatePasswordForm />
    </div>
  )
}
