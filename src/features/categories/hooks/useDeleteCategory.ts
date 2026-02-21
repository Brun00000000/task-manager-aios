'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

interface DeleteResult {
  id: string
  task_count?: number
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation<DeleteResult, Error & { task_count?: number }, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))

      if (res.status === 409) {
        const err = Object.assign(
          new Error(body?.error?.message ?? 'Category has tasks'),
          { task_count: body?.error?.task_count as number }
        )
        throw err
      }
      if (!res.ok) {
        throw new Error(body?.error?.message ?? 'Failed to delete category')
      }
      return body.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
