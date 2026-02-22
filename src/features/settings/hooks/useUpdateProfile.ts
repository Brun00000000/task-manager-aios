'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ProfileFormValues } from '@/features/settings/schemas/settings.schema'

export function useUpdateProfile() {
  return useMutation<void, Error, ProfileFormValues>({
    mutationFn: async (data) => {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? 'Erro ao atualizar perfil')
      }
    },
    onSuccess: () => toast.success('Perfil atualizado com sucesso'),
    onError: (err) => toast.error(err.message),
  })
}
