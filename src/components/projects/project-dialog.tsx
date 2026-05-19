'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProjectForm } from './project-form'
import type { ActionResult } from '@/lib/actions/helpers'
import type { ProjectStatus } from '@/types/database'

type FormAction = (
  state: ActionResult | undefined,
  formData: FormData,
) => Promise<ActionResult>

export function ProjectDialog({
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
    status?: ProjectStatus
    color?: string | null
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
          <ProjectForm
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
