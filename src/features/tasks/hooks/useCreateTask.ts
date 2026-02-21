'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TaskCreate } from '@/features/tasks/schemas/task.schema'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation<TaskSummary, Error, TaskCreate>({
    mutationFn: async (data: TaskCreate) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'Failed to create task')
      }
      const json = await res.json()
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
