'use client'

import { CheckSquare, Circle, Clock, AlertCircle, ListTodo } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCard } from '@/features/dashboard/components/StatsCard'
import { ActivityChart } from '@/features/dashboard/components/ActivityChart'
import { UpcomingList } from '@/features/dashboard/components/UpcomingList'
import { DashboardEmpty } from '@/features/dashboard/components/DashboardEmpty'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats()
  const stats = data?.data

  if (isLoading) return <DashboardSkeleton />

  if (!stats || stats.total === 0) return <DashboardEmpty />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral das suas tarefas</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatsCard title="Total" value={stats.total} icon={ListTodo} />
        <StatsCard title="A fazer" value={stats.todo} icon={Circle} />
        <StatsCard title="Em andamento" value={stats.in_progress} icon={Clock} />
        <StatsCard title="Concluídas" value={stats.done} icon={CheckSquare} />
        <StatsCard title="Atrasadas" value={stats.overdue} icon={AlertCircle} variant="red" />
      </div>

      <ActivityChart data={stats.activity} />

      <UpcomingList dueToday={stats.due_today} upcoming={stats.upcoming} />
    </div>
  )
}
