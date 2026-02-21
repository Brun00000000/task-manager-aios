'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

export function useRestoreTask() {
  const queryClient = useQueryClient()

  return useMutation<TaskSummary, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}/restore`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'Failed to restore task')
      }
      const json = await res.json()
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'trash'] })
    },
  })
}
