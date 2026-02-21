'use client'

import { format, isPast, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskSummary, TaskPriority, TaskStatus } from '@/lib/repositories/TaskRepository'

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Baixa', className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' },
  medium: { label: 'Média', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  high: { label: 'Alta', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
  urgent: { label: 'Urgente', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
}

const statusConfig: Record<TaskStatus, string> = {
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
}

export function TaskCard({ task }: TaskCardProps) {
  const overdue = isOverdue(task)
  const priority = priorityConfig[task.priority]

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50',
        overdue && 'border-red-300 bg-red-50/30'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug line-clamp-2">{task.title}</p>
        <Badge className={cn('shrink-0 text-xs font-medium', priority.className)}>
          {priority.label}
        </Badge>
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

        <span className="rounded bg-muted px-1.5 py-0.5">
          {statusConfig[task.status]}
        </span>
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
