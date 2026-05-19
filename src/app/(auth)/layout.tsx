import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 bg-background">
      <Link href="/" className="mb-8 text-xl font-semibold tracking-tight">
        EpuBrain
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
