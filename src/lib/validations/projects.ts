import { z } from 'zod'

export const PROJECT_STATUSES = ['active', 'on_hold', 'completed', 'archived'] as const

export const projectSchema = z.object({
  area_id: z.string().uuid(),
  name: z.string().min(1, 'El nombre es obligatorio').max(120, 'Máximo 120 caracteres'),
  description: z
    .string()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  status: z.enum(PROJECT_STATUSES).default('active'),
  color: z
    .string()
    .max(20)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
})

export const projectUpdateSchema = projectSchema.omit({ area_id: true })

export type ProjectInput = z.infer<typeof projectSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>
