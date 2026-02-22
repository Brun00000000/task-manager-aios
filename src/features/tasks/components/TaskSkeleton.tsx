import { Skeleton } from '@/components/ui/skeleton'

export function TaskSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando tarefa..."
      className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm"
    >
      <span className="sr-only">Carregando tarefa...</span>
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-16 shrink-0" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}
