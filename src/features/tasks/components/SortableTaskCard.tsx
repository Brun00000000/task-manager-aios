'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskCard } from './TaskCard'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

interface SortableTaskCardProps {
  task: TaskSummary
  onEdit?: (task: TaskSummary) => void
  onCategoryFilter?: (categoryId: string) => void
}

export function SortableTaskCard({ task, onEdit, onCategoryFilter }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn('group/sortable flex items-start gap-1', isDragging && 'opacity-50')}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-4 shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover/sortable:opacity-100 hover:bg-muted active:cursor-grabbing"
        aria-label="Arrastar para reordenar"
        tabIndex={-1}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <TaskCard task={task} onEdit={onEdit} onCategoryFilter={onCategoryFilter} />
      </div>
    </div>
  )
}
