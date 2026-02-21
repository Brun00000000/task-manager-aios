import { z } from 'zod'

export const taskCreateSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(255),
  description: z.string().max(2000).optional().nullable(),
  due_date: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  category_ids: z.array(z.string().uuid()).max(5).optional().default([]),
})

export const taskUpdateSchema = taskCreateSchema.partial()

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category_id: z.string().uuid().optional(),
  due: z.enum(['today', 'week', 'overdue', 'none']).optional(),
  search: z.string().max(200).optional(),
})

export type TaskCreate = z.infer<typeof taskCreateSchema>
export type TaskUpdate = z.infer<typeof taskUpdateSchema>
export type TaskQuery = z.infer<typeof taskQuerySchema>
