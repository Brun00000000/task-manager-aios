import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FilterChip } from '@/features/tasks/hooks/useTaskFilters'

interface FilterChipsProps {
  chips: FilterChip[]
  onClearAll: () => void
}

export function FilterChips({ chips, onClearAll }: FilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="ml-0.5 rounded-full hover:text-destructive"
            aria-label={`Remover filtro: ${chip.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onClearAll}>
        Limpar filtros
      </Button>
    </div>
  )
}
