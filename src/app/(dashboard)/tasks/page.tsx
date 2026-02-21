'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/features/tasks/components/TaskList'
import { TaskDrawer } from '@/features/tasks/components/TaskDrawer'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

export default function TasksPage() {
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskSummary | null>(null)
  const limit = 20

  const { data, isLoading } = useTasks({ page, limit })

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

      <TaskList
        tasks={data?.data ?? []}
        isLoading={isLoading}
        total={data?.meta.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onCreateTask={openCreate}
        onEditTask={openEdit}
      />

      <TaskDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
        task={editingTask}
      />
    </div>
  )
}
