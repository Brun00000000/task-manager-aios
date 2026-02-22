import { z } from 'zod'

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
})

export const passwordSchema = z
  .object({
    new_password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Senhas não conferem',
    path: ['confirm_password'],
  })

export type ProfileFormValues = z.infer<typeof profileSchema>
export type PasswordFormValues = z.infer<typeof passwordSchema>
