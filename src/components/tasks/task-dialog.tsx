'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskForm } from './task-form'
import type { ActionResult } from '@/lib/actions/helpers'
import type { TaskPriority, TaskStatus } from '@/types/database'

type FormAction = (
  state: ActionResult | undefined,
  formData: FormData,
) => Promise<ActionResult>

export function TaskDialog({
  open,
  initial,
  action,
  cancelHref,
  title,
  submitLabel,
}: {
  open: boolean
  initial?: {
    title?: string
    content?: string | null
    status?: TaskStatus
    priority?: TaskPriority
    due_date?: string | null
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
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <TaskForm
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
