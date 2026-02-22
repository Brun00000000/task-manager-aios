'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { profileSchema, type ProfileFormValues } from '@/features/settings/schemas/settings.schema'
import { useUpdateProfile } from '@/features/settings/hooks/useUpdateProfile'

interface ProfileFormProps {
  initialName: string
  email: string
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: initialName },
  })

  function onSubmit(data: ProfileFormValues) {
    updateProfile(data)
  }

  return (
    <section className="rounded-lg border bg-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold">Perfil</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled className="bg-muted text-muted-foreground" />
          <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input
            id="full_name"
            placeholder="Seu nome"
            {...register('full_name')}
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? 'full_name_error' : undefined}
          />
          {errors.full_name && (
            <p id="full_name_error" className="text-xs text-destructive">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </section>
  )
}
