'use client'

import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRestoreTask } from '@/features/tasks/hooks/useRestoreTask'
import type { TaskSummary } from '@/lib/repositories/TaskRepository'

interface TrashResponse {
  data: TaskSummary[]
}

export function TrashList() {
  const { data, isLoading } = useQuery<TrashResponse>({
    queryKey: ['tasks', 'trash'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/trash')
      if (!res.ok) throw new Error('Failed to fetch trash')
      return res.json()
    },
  })

  const { mutate: restoreTask, isPending } = useRestoreTask()
  const tasks = data?.data ?? []

  function handleRestore(task: TaskSummary) {
    restoreTask(task.id, {
      onSuccess: () => toast.success(`"${task.title}" restaurada`),
      onError: () => toast.error('Erro ao restaurar tarefa'),
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card py-12 text-center">
        <Trash2 className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Lixeira vazia</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-muted-foreground">{task.title}</p>
            {task.deleted_at && (
              <p className="text-xs text-muted-foreground/70">
                Excluída em{' '}
                {format(parseISO(task.deleted_at), "dd 'de' MMM 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleRestore(task)}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Restaurar
          </Button>
        </div>
      ))}
    </div>
  )
}
