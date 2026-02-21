'use client'

import { useQuery } from '@tanstack/react-query'
import type { CategoryWithCount } from '@/lib/repositories/CategoryRepository'

interface CategoryMultiSelectProps {
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

export function CategoryMultiSelect({ value, onChange, disabled }: CategoryMultiSelectProps) {
  const { data } = useQuery<{ data: CategoryWithCount[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })

  const categories = data?.data ?? []

  if (categories.length === 0) return null

  function toggle(id: string) {
    if (disabled) return
    const next = value.includes(id)
      ? value.filter((c) => c !== id)
      : value.length < 5
      ? [...value, id]
      : value
    onChange(next)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const selected = value.includes(cat.id)
        const atLimit = !selected && value.length >= 5
        return (
          <button
            key={cat.id}
            type="button"
            disabled={atLimit || disabled}
            onClick={() => toggle(cat.id)}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={
              selected
                ? { backgroundColor: `${cat.color}25`, borderColor: cat.color, color: cat.color }
                : {}
            }
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}
