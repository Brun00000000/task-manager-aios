'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CategoryCreate } from '@/features/categories/schemas/category.schema'
import type { CategoryWithCount } from '@/lib/repositories/CategoryRepository'

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation<CategoryWithCount, Error, CategoryCreate>({
    mutationFn: async (data) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'Failed to create category')
      }
      const json = await res.json()
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
