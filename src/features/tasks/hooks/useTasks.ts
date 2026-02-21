'use client'

import { useQuery } from '@tanstack/react-query'
import type { TaskQuery } from '@/features/tasks/schemas/task.schema'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

interface TaskListResponse {
  data: TaskSummary[]
  meta: { total: number; page: number; limit: number }
}

export function useTasks(query: Partial<TaskQuery> = {}) {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.status) params.set('status', query.status)
  if (query.priority) params.set('priority', query.priority)
  if (query.category_id) params.set('category_id', query.category_id)
  if (query.due) params.set('due', query.due)
  if (query.search) params.set('search', query.search)

  return useQuery<TaskListResponse>({
    queryKey: ['tasks', query],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      return res.json()
    },
  })
}
