'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { passwordSchema, type PasswordFormValues } from '@/features/settings/schemas/settings.schema'
import { useUpdatePassword } from '@/features/settings/hooks/useUpdatePassword'

export function PasswordForm() {
  const { mutate: updatePassword, isPending } = useUpdatePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  })

  function onSubmit(data: PasswordFormValues) {
    updatePassword(data.new_password, { onSuccess: () => reset() })
  }

  return (
    <section className="rounded-lg border bg-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold">Segurança</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new_password">Nova senha</Label>
          <Input
            id="new_password"
            type="password"
            placeholder="••••••"
            autoComplete="new-password"
            {...register('new_password')}
            aria-invalid={!!errors.new_password}
            aria-describedby={errors.new_password ? 'new_password_error' : undefined}
          />
          {errors.new_password && (
            <p id="new_password_error" className="text-xs text-destructive">
              {errors.new_password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm_password">Confirmar nova senha</Label>
          <Input
            id="confirm_password"
            type="password"
            placeholder="••••••"
            autoComplete="new-password"
            {...register('confirm_password')}
            aria-invalid={!!errors.confirm_password}
            aria-describedby={errors.confirm_password ? 'confirm_password_error' : undefined}
          />
          {errors.confirm_password && (
            <p id="confirm_password_error" className="text-xs text-destructive">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Atualizando...' : 'Atualizar senha'}
          </Button>
        </div>
      </form>
    </section>
  )
}
