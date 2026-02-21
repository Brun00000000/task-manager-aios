'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CategoryUpdate } from '@/features/categories/schemas/category.schema'
import type { CategoryWithCount } from '@/lib/repositories/CategoryRepository'

interface UpdateCategoryVars {
  id: string
  data: CategoryUpdate
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation<CategoryWithCount, Error, UpdateCategoryVars>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'Failed to update category')
      }
      const json = await res.json()
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
