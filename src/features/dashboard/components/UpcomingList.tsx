import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskSummary, TaskPriority } from '@/lib/repositories/TaskRepository'

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Baixa', className: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Média', className: 'bg-blue-100 text-blue-700' },
  high: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
}

function TaskRow({ task }: { task: TaskSummary }) {
  const priority = priorityConfig[task.priority]
  return (
    <Link
      href="/tasks"
      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60 transition-colors"
    >
      <span className="flex-1 truncate text-sm">{task.title}</span>
      <div className="flex shrink-0 items-center gap-2">
        {task.due_date && (
          <span className="text-xs text-muted-foreground">
            {format(parseISO(task.due_date), 'dd MMM', { locale: ptBR })}
          </span>
        )}
        <Badge className={cn('text-xs', priority.className)}>{priority.label}</Badge>
      </div>
    </Link>
  )
}

interface UpcomingListProps {
  dueToday: TaskSummary[]
  upcoming: TaskSummary[]
}

export function UpcomingList({ dueToday, upcoming }: UpcomingListProps) {
  if (dueToday.length === 0 && upcoming.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {dueToday.length > 0 && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium text-orange-600">
            Vencendo hoje ({dueToday.length})
          </p>
          <div className="flex flex-col">
            {dueToday.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Próximas</p>
          <div className="flex flex-col">
            {upcoming.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
