'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

export function SubmitButton({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : children}
    </Button>
  )
}
