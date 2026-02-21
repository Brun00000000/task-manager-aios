'use client'

import { useQuery } from '@tanstack/react-query'
import type { CategoryWithCount } from '@/lib/repositories/CategoryRepository'

export function useCategories() {
  return useQuery<{ data: CategoryWithCount[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })
}
