'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { TaskStatus, TaskPriority } from '@/lib/repositories/TaskRepository'

export type DueFilter = 'today' | 'week' | 'overdue' | 'none'

export interface TaskFilters {
  search: string
  status: TaskStatus[]
  priority: TaskPriority[]
  due: DueFilter | undefined
  category_id: string | undefined
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'A fazer',
  in_progress: 'Em andamento',
  done: 'Concluída',
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

const DUE_LABELS: Record<DueFilter, string> = {
  today: 'Vence hoje',
  week: 'Esta semana',
  overdue: 'Atrasadas',
  none: 'Sem prazo',
}

export interface FilterChip {
  key: string
  label: string
  onRemove: () => void
}

export function useTaskFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: TaskFilters = {
    search: searchParams.get('search') ?? '',
    status: (searchParams.getAll('status') as TaskStatus[]).filter(Boolean),
    priority: (searchParams.getAll('priority') as TaskPriority[]).filter(Boolean),
    due: (searchParams.get('due') as DueFilter | null) ?? undefined,
    category_id: searchParams.get('category_id') ?? undefined,
  }

  function buildParams(updater: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    updater(params)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function setSearch(value: string) {
    buildParams((p) => {
      if (value) p.set('search', value)
      else p.delete('search')
    })
  }

  function toggleStatus(value: TaskStatus) {
    buildParams((p) => {
      const current = p.getAll('status')
      p.delete('status')
      if (current.includes(value)) {
        current.filter((s) => s !== value).forEach((s) => p.append('status', s))
      } else {
        ;[...current, value].forEach((s) => p.append('status', s))
      }
    })
  }

  function togglePriority(value: TaskPriority) {
    buildParams((p) => {
      const current = p.getAll('priority')
      p.delete('priority')
      if (current.includes(value)) {
        current.filter((s) => s !== value).forEach((s) => p.append('priority', s))
      } else {
        ;[...current, value].forEach((s) => p.append('priority', s))
      }
    })
  }

  function setDue(value: DueFilter | undefined) {
    buildParams((p) => {
      if (value) p.set('due', value)
      else p.delete('due')
    })
  }

  function toggleCategory(categoryId: string) {
    buildParams((p) => {
      if (p.get('category_id') === categoryId) p.delete('category_id')
      else p.set('category_id', categoryId)
    })
  }

  function clearFilters() {
    router.push(pathname, { scroll: false })
  }

  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.due !== undefined ||
    filters.category_id !== undefined

  const chips: FilterChip[] = [
    ...filters.status.map((s) => ({
      key: `status-${s}`,
      label: `Status: ${STATUS_LABELS[s]}`,
      onRemove: () => toggleStatus(s),
    })),
    ...filters.priority.map((p) => ({
      key: `priority-${p}`,
      label: `Prioridade: ${PRIORITY_LABELS[p]}`,
      onRemove: () => togglePriority(p),
    })),
    ...(filters.due
      ? [
          {
            key: `due-${filters.due}`,
            label: `Prazo: ${DUE_LABELS[filters.due]}`,
            onRemove: () => setDue(undefined),
          },
        ]
      : []),
    ...(filters.search
      ? [
          {
            key: 'search',
            label: `Busca: "${filters.search}"`,
            onRemove: () => setSearch(''),
          },
        ]
      : []),
  ]

  return {
    filters,
    setSearch,
    toggleStatus,
    togglePriority,
    setDue,
    toggleCategory,
    clearFilters,
    hasActiveFilters,
    chips,
  }
}
