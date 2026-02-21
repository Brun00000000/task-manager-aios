'use client'

import { useState, useRef } from 'react'
import { format, isPast, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, AlertCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useUpdateTask } from '@/features/tasks/hooks/useUpdateTask'
import { useDeleteTask } from '@/features/tasks/hooks/useDeleteTask'
import { useRestoreTask } from '@/features/tasks/hooks/useRestoreTask'
import type { TaskSummary, TaskPriority, TaskStatus } from '@/lib/repositories/TaskRepository'

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Baixa', className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' },
  medium: { label: 'Média', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  high: { label: 'Alta', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
  urgent: { label: 'Urgente', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'A fazer',
  in_progress: 'Em andamento',
  done: 'Concluída',
}

function isOverdue(task: TaskSummary): boolean {
  return (
    !!task.due_date &&
    task.status !== 'done' &&
    isPast(parseISO(task.due_date))
  )
}

interface TaskCardProps {
  task: TaskSummary
  onEdit?: (task: TaskSummary) => void
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const overdue = isOverdue(task)
  const priority = priorityConfig[task.priority]

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const { mutate: updateTask } = useUpdateTask()
  const { mutate: deleteTask } = useDeleteTask()
  const { mutate: restoreTask } = useRestoreTask()

  function startTitleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setEditingTitle(true)
    setTitleValue(task.title)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function saveTitleEdit() {
    const trimmed = titleValue.trim()
    if (trimmed.length >= 3 && trimmed !== task.title) {
      updateTask({ id: task.id, data: { title: trimmed } })
    } else {
      setTitleValue(task.title)
    }
    setEditingTitle(false)
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') saveTitleEdit()
    if (e.key === 'Escape') {
      setTitleValue(task.title)
      setEditingTitle(false)
    }
  }

  function handleStatusChange(value: string) {
    updateTask({ id: task.id, data: { status: value as TaskStatus } })
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    deleteTask(task.id, {
      onSuccess: () => {
        toast('Tarefa movida para a lixeira', {
          duration: 5000,
          action: {
            label: 'Desfazer',
            onClick: () =>
              restoreTask(task.id, {
                onSuccess: () => toast.success('Tarefa restaurada'),
              }),
          },
        })
      },
    })
  }

  function handleCardClick() {
    if (!editingTitle) {
      onEdit?.(task)
    }
  }

  return (
    <div
      className={cn(
        'group flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-colors cursor-pointer hover:bg-accent/50',
        overdue && 'border-red-300 bg-red-50/30'
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-2">
        {editingTitle ? (
          <input
            ref={inputRef}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={saveTitleEdit}
            onKeyDown={handleTitleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border bg-background px-2 py-0.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <p
            className="flex-1 font-medium leading-snug line-clamp-2 hover:underline decoration-dotted cursor-text"
            onClick={startTitleEdit}
          >
            {task.title}
          </p>
        )}

        <div className="flex shrink-0 items-center gap-1">
          <Badge className={cn('text-xs font-medium', priority.className)}>
            {priority.label}
          </Badge>
          <button
            onClick={handleDelete}
            className="rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
            aria-label="Excluir tarefa"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {task.due_date && (
          <span
            className={cn(
              'flex items-center gap-1',
              overdue && 'text-red-600 font-medium'
            )}
          >
            {overdue ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Calendar className="h-3 w-3" />
            )}
            {format(parseISO(task.due_date), 'dd MMM yyyy', { locale: ptBR })}
          </span>
        )}

        <div onClick={(e) => e.stopPropagation()}>
          <Select value={task.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-6 w-auto border-0 bg-muted px-1.5 py-0 text-xs font-medium shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(statusLabels) as TaskStatus[]).map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {statusLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {task.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
