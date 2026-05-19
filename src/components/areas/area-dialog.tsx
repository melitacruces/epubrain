'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AreaForm } from './area-form'
import type { ActionResult } from '@/lib/actions/helpers'

type FormAction = (
  state: ActionResult | undefined,
  formData: FormData,
) => Promise<ActionResult>

export function AreaDialog({
  open,
  initial,
  action,
  cancelHref,
  title,
  submitLabel,
}: {
  open: boolean
  initial?: {
    name?: string
    description?: string | null
    color?: string | null
    icon?: string | null
  }
  action: FormAction
  cancelHref: string
  title: string
  submitLabel: string
}) {
  const router = useRouter()

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          router.push(cancelHref)
        }
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <AreaForm
            action={action}
            initial={initial}
            cancelHref={cancelHref}
            submitLabel={submitLabel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
