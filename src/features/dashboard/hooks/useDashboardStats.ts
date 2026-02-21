'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardStats } from '@/lib/repositories/TaskRepository'

export function useDashboardStats() {
  return useQuery<{ data: DashboardStats }>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('Failed to fetch dashboard stats')
      return res.json()
    },
    refetchInterval: 60 * 1000,
  })
}
