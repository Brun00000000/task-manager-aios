'use client'

import { Button } from '@/components/ui/button'
import { TaskCard } from './TaskCard'
import { TaskSkeleton } from './TaskSkeleton'
import { EmptyState } from './EmptyState'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

interface TaskListProps {
  tasks: TaskSummary[]
  isLoading: boolean
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onCreateTask: () => void
  onEditTask?: (task: TaskSummary) => void
}

export function TaskList({
  tasks,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
  onCreateTask,
  onEditTask,
}: TaskListProps) {
  const totalPages = Math.ceil(total / limit)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return <EmptyState onCreateTask={onCreateTask} />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEditTask} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
          <span>
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total} tarefas
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
