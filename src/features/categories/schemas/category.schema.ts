import { z } from 'zod'

export const CATEGORY_COLORS = [
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Laranja',  value: '#f97316' },
  { label: 'Amarelo',  value: '#eab308' },
  { label: 'Verde',    value: '#22c55e' },
  { label: 'Teal',     value: '#14b8a6' },
  { label: 'Azul',     value: '#3b82f6' },
  { label: 'Indigo',   value: '#6366f1' },
  { label: 'Roxo',     value: '#8b5cf6' },
  { label: 'Rosa',     value: '#ec4899' },
  { label: 'Cinza',    value: '#64748b' },
  { label: 'Marrom',   value: '#78716c' },
  { label: 'Ciano',    value: '#0ea5e9' },
] as const

const colorValues: string[] = CATEGORY_COLORS.map((c) => c.value)

export const categoryCreateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50),
  color: z.string().refine((v) => colorValues.includes(v), { message: 'Cor inválida' }),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

export type CategoryCreate = z.infer<typeof categoryCreateSchema>
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>
