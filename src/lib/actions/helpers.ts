import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Resuelve el cliente + el user autenticado. Si no hay sesión, va a /login.
export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export type ActionResult = { ok: true } | { ok: false; error: string }
