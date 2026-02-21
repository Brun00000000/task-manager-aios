'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { SortableTaskCard } from './SortableTaskCard'
import { TaskCard } from './TaskCard'
import { TaskSkeleton } from './TaskSkeleton'
import { EmptyState } from './EmptyState'
import { useReorderTasks } from '@/features/tasks/hooks/useReorderTasks'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

interface SortableTaskListProps {
  tasks: TaskSummary[]
  isLoading: boolean
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onCreateTask: () => void
  onEditTask?: (task: TaskSummary) => void
  onCategoryFilter?: (categoryId: string) => void
}

export function SortableTaskList({
  tasks,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
  onCreateTask,
  onEditTask,
  onCategoryFilter,
}: SortableTaskListProps) {
  const [localTasks, setLocalTasks] = useState<TaskSummary[]>(tasks)
  const [activeTask, setActiveTask] = useState<TaskSummary | null>(null)
  const { mutate: reorderTasks } = useReorderTasks()

  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const totalPages = Math.ceil(total / limit)

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    setActiveTask(localTasks.find((t) => t.id === id) ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const oldIndex = localTasks.findIndex((t) => t.id === activeId)
    const newIndex = localTasks.findIndex((t) => t.id === overId)
    const snapshot = [...localTasks]
    const reordered = arrayMove(localTasks, oldIndex, newIndex)

    // Positions account for page offset so cross-page positions don't collide
    const offset = (page - 1) * limit
    setLocalTasks(reordered)
    reorderTasks(
      reordered.map((t, i) => ({ id: t.id, position: (offset + i + 1) * 1000 })),
      { onError: () => setLocalTasks(snapshot) }
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (localTasks.length === 0) {
    return <EmptyState onCreateTask={onCreateTask} />
  }

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={localTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {localTasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onCategoryFilter={onCategoryFilter}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-1 scale-105 opacity-90 shadow-2xl">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
