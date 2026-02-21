'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

interface TaskListResponse {
  data: TaskSummary[]
  meta: { total: number; page: number; limit: number }
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'Failed to delete task')
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const snapshots = queryClient.getQueriesData<TaskListResponse>({ queryKey: ['tasks'] })

      queryClient.setQueriesData<TaskListResponse>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.filter((t) => t.id !== id),
          meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
        }
      })

      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      const context = ctx as { snapshots?: [unknown, TaskListResponse | undefined][] } | undefined
      context?.snapshots?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey as string[], data)
      })
      toast.error('Erro ao excluir tarefa')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
