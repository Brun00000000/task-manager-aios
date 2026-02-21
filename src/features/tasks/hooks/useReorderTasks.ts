'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ReorderItem {
  id: string
  position: number
}

export function useReorderTasks() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ReorderItem[]>({
    mutationFn: async (items) => {
      const res = await fetch('/api/tasks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) throw new Error('Failed to reorder tasks')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: () => {
      toast.error('Erro ao salvar ordenação')
    },
  })
}
