'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/features/tasks/components/TaskList'
import { TaskDrawer } from '@/features/tasks/components/TaskDrawer'
import { useTasks } from '@/features/tasks/hooks/useTasks'

export default function TasksPage() {
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const limit = 20

  const { data, isLoading } = useTasks({ page, limit })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {data.meta.total} {data.meta.total === 1 ? 'tarefa' : 'tarefas'}
            </p>
          )}
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <TaskList
        tasks={data?.data ?? []}
        isLoading={isLoading}
        total={data?.meta.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onCreateTask={() => setDrawerOpen(true)}
      />

      <TaskDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
