import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_COLORS } from '@/features/categories/schemas/category.schema'

interface CategoryColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function CategoryColorPicker({ value, onChange }: CategoryColorPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          title={color.label}
          onClick={() => onChange(color.value)}
          className={cn(
            'h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            value === color.value && 'ring-2 ring-offset-1 ring-foreground scale-110'
          )}
          style={{ backgroundColor: color.value }}
        >
          {value === color.value && (
            <Check className="mx-auto h-3.5 w-3.5 text-white drop-shadow" />
          )}
        </button>
      ))}
    </div>
  )
}
