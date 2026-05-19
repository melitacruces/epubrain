import { z } from 'zod'

export const areaSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(80, 'Máximo 80 caracteres'),
  description: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  color: z
    .string()
    .max(20)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  icon: z
    .string()
    .max(40)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
})

export type AreaInput = z.infer<typeof areaSchema>
