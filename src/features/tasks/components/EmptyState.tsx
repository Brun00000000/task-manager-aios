import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onCreateTask: () => void
}

export function EmptyState({ onCreateTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-card py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ClipboardList className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-semibold">Nenhuma tarefa ainda</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Comece criando sua primeira tarefa para organizar seu trabalho.
        </p>
      </div>
      <Button onClick={onCreateTask}>Criar primeira tarefa</Button>
    </div>
  )
}
