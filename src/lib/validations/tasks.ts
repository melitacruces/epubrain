import { z } from 'zod'

export const TASK_STATUSES = ['backlog', 'todo', 'in_progress', 'blocked', 'done'] as const
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const

const dateOrNull = z
  .string()
  .optional()
  .transform((v) => (v?.trim() ? v.trim() : null))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato AAAA-MM-DD').nullable())

export const taskSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1, 'El título es obligatorio').max(200, 'Máximo 200 caracteres'),
  content: z
    .string()
    .max(20000, 'Máximo 20.000 caracteres')
    .optional()
    .transform((v) => (v?.trim() ? v : null)),
  status: z.enum(TASK_STATUSES).default('todo'),
  priority: z.enum(TASK_PRIORITIES).default('medium'),
  due_date: dateOrNull,
})

export const taskUpdateSchema = taskSchema.omit({ project_id: true })

export type TaskInput = z.infer<typeof taskSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>
