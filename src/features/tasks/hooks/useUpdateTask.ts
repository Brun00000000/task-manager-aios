'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TaskUpdate } from '@/features/tasks/schemas/task.schema'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

interface UpdateTaskVars {
  id: string
  data: TaskUpdate
}

interface TaskListResponse {
  data: TaskSummary[]
  meta: { total: number; page: number; limit: number }
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation<TaskSummary, Error, UpdateTaskVars>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'Failed to update task')
      }
      const json = await res.json()
      return json.data
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const snapshots = queryClient.getQueriesData<TaskListResponse>({ queryKey: ['tasks'] })

      queryClient.setQueriesData<TaskListResponse>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((t) => (t.id === id ? { ...t, ...data } : t)),
        }
      })

      return { snapshots }
    },
    onError: (_err, _vars, ctx) => {
      const context = ctx as { snapshots?: [unknown, TaskListResponse | undefined][] } | undefined
      context?.snapshots?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey as string[], data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
