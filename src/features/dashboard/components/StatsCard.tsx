import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  variant?: 'default' | 'red'
}

export function StatsCard({ title, value, icon: Icon, variant = 'default' }: StatsCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm',
        variant === 'red' && 'border-red-200 bg-red-50/40'
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-sm font-medium text-muted-foreground',
            variant === 'red' && 'text-red-600'
          )}
        >
          {title}
        </span>
        <Icon
          className={cn(
            'h-4 w-4 text-muted-foreground/60',
            variant === 'red' && 'text-red-400'
          )}
        />
      </div>
      <span
        className={cn(
          'text-3xl font-bold tracking-tight',
          variant === 'red' && 'text-red-700'
        )}
      >
        {value}
      </span>
    </div>
  )
}
