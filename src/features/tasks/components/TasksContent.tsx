'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SortableTaskList } from './SortableTaskList'
import { TaskDrawer } from './TaskDrawer'
import { FilterBar } from './FilterBar'
import { FilterChips } from './FilterChips'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { useTaskFilters } from '@/features/tasks/hooks/useTaskFilters'
import { useDebounce } from '@/hooks/useDebounce'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

export function TasksContent() {
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskSummary | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const limit = 20

  const {
    filters,
    setSearch,
    toggleStatus,
    togglePriority,
    setDue,
    toggleCategory,
    clearFilters,
    hasActiveFilters,
    chips,
  } = useTaskFilters()

  const debouncedSearch = useDebounce(searchInput, 300)

  // Sync debounced search to URL
  if (debouncedSearch !== filters.search) {
    setSearch(debouncedSearch)
    if (page !== 1) setPage(1)
  }

  const { data, isLoading } = useTasks({
    page,
    limit,
    status: filters.status[0],
    priority: filters.priority[0],
    due: filters.due,
    search: filters.search || undefined,
    category_id: filters.category_id,
  })

  function openCreate() {
    setEditingTask(null)
    setDrawerOpen(true)
  }

  function openEdit(task: TaskSummary) {
    setEditingTask(task)
    setDrawerOpen(true)
  }

  function handleDrawerClose(open: boolean) {
    setDrawerOpen(open)
    if (!open) setEditingTask(null)
  }

  function handleClearFilters() {
    clearFilters()
    setSearchInput('')
    setPage(1)
  }

  const total = data?.meta.total ?? 0
  const showing = data?.data.length ?? 0
  const showCount = hasActiveFilters && !isLoading

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
          {data && !hasActiveFilters && (
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'tarefa' : 'tarefas'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks/trash">
              <Trash2 className="mr-1.5 h-4 w-4" />
              Lixeira
            </Link>
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <FilterBar
        searchValue={searchInput}
        filters={filters}
        onSearchChange={setSearchInput}
        onToggleStatus={(v) => { toggleStatus(v); setPage(1) }}
        onTogglePriority={(v) => { togglePriority(v); setPage(1) }}
        onSetDue={(v) => { setDue(v); setPage(1) }}
        onToggleCategory={(id) => { toggleCategory(id); setPage(1) }}
      />

      {hasActiveFilters && (
        <FilterChips chips={chips} onClearAll={handleClearFilters} />
      )}

      {showCount && (
        <p className="text-sm text-muted-foreground">
          Exibindo {showing} de {total} {total === 1 ? 'tarefa' : 'tarefas'}
        </p>
      )}

      <SortableTaskList
        tasks={data?.data ?? []}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onCreateTask={openCreate}
        onEditTask={openEdit}
        onCategoryFilter={(id) => { toggleCategory(id); setPage(1) }}
      />

      <TaskDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
        task={editingTask}
      />
    </div>
  )
}
