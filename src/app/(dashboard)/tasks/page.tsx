import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { TasksContent } from '@/features/tasks/components/TasksContent'

function TasksLoadingFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksLoadingFallback />}>
      <TasksContent />
    </Suspense>
  )
}
