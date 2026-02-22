'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { cn } from '@/lib/utils'
import type { TaskStatus, TaskPriority } from '@/lib/repositories/TaskRepository'
import type { DueFilter, TaskFilters } from '@/features/tasks/hooks/useTaskFilters'

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'A fazer' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'done', label: 'Concluída' },
]

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

const DUE_OPTIONS: { value: DueFilter; label: string }[] = [
  { value: 'today', label: 'Vence hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'overdue', label: 'Atrasadas' },
  { value: 'none', label: 'Sem prazo' },
]

function MultiToggle<T extends string>({
  options,
  selected,
  onToggle,
  groupLabel,
}: {
  options: { value: T; label: string }[]
  selected: T[]
  onToggle: (value: T) => void
  groupLabel: string
}) {
  return (
    <div role="group" aria-label={groupLabel} className="flex flex-wrap gap-1">
      {options.map((opt) => {
        const active = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            aria-pressed={active}
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background hover:bg-muted'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

interface FilterBarProps {
  searchValue: string
  filters: TaskFilters
  onSearchChange: (value: string) => void
  onToggleStatus: (value: TaskStatus) => void
  onTogglePriority: (value: TaskPriority) => void
  onSetDue: (value: DueFilter | undefined) => void
  onToggleCategory: (categoryId: string) => void
}

export function FilterBar({
  searchValue,
  filters,
  onSearchChange,
  onToggleStatus,
  onTogglePriority,
  onSetDue,
  onToggleCategory,
}: FilterBarProps) {
  const { data: categoriesData } = useCategories()

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          placeholder="Buscar tarefas..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
          aria-label="Buscar tarefas"
        />
      </div>

      <div className="flex flex-wrap items-start gap-4">
        {/* Status */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">Status</span>
          <MultiToggle
            options={STATUSES}
            selected={filters.status}
            onToggle={onToggleStatus}
            groupLabel="Filtrar por status"
          />
        </div>

        {/* Prioridade */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">Prioridade</span>
          <MultiToggle
            options={PRIORITIES}
            selected={filters.priority}
            onToggle={onTogglePriority}
            groupLabel="Filtrar por prioridade"
          />
        </div>

        {/* Prazo */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">Prazo</span>
          <Select
            value={filters.due ?? ''}
            onValueChange={(v) => onSetDue(v === '' ? undefined : (v as DueFilter))}
          >
            <SelectTrigger className="h-7 w-36 text-xs" aria-label="Filtrar por prazo">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Qualquer</SelectItem>
              {DUE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        {categoriesData && categoriesData.data && categoriesData.data.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">Categoria</span>
            <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-1">
              {categoriesData.data.map((cat) => {
                const active = filters.category_id === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onToggleCategory(cat.id)}
                    aria-pressed={active}
                    aria-label={`${cat.name}${active ? ' (ativo)' : ''}`}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity',
                      active ? 'opacity-100 outline outline-2 outline-offset-1' : 'opacity-60 hover:opacity-80'
                    )}
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" aria-hidden="true" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
