'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function useUpdatePassword() {
  return useMutation<void, Error, string>({
    mutationFn: async (newPassword) => {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => toast.success('Senha atualizada com sucesso'),
    onError: (err) => toast.error(err.message),
  })
}
