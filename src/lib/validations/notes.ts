import { z } from 'zod'

const scopeFields = z.object({
  area_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  task_id: z.string().uuid().nullable().optional(),
})

export const noteSchema = scopeFields.extend({
  title: z
    .string()
    .max(200, 'Máximo 200 caracteres')
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  content: z.string().min(1, 'La nota no puede estar vacía').max(20000, 'Máximo 20.000 caracteres'),
}).refine(
  (data) =>
    [data.area_id, data.project_id, data.task_id].filter(
      (v) => v !== null && v !== undefined,
    ).length === 1,
  { message: 'La nota debe colgar de exactamente una entidad' },
)

export const noteUpdateSchema = z.object({
  title: z
    .string()
    .max(200, 'Máximo 200 caracteres')
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  content: z.string().min(1, 'La nota no puede estar vacía').max(20000, 'Máximo 20.000 caracteres'),
})

export type NoteScope = { area_id?: string; project_id?: string; task_id?: string }
export type NoteInput = z.infer<typeof noteSchema>
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>
