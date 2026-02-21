'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategoryColorPicker } from './CategoryColorPicker'
import { categoryCreateSchema, type CategoryCreate } from '@/features/categories/schemas/category.schema'
import { useCreateCategory } from '@/features/categories/hooks/useCreateCategory'
import { useUpdateCategory } from '@/features/categories/hooks/useUpdateCategory'
import type { CategoryWithCount } from '@/lib/repositories/CategoryRepository'

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: CategoryWithCount | null
}

export function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
  const isEditMode = !!category
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory()
  const isPending = isCreating || isUpdating

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<CategoryCreate>({
      resolver: zodResolver(categoryCreateSchema),
      defaultValues: { name: '', color: '#3b82f6' },
    })

  const watchedColor = watch('color')

  useEffect(() => {
    if (open && category) {
      reset({ name: category.name, color: category.color })
    } else if (!open) {
      reset({ name: '', color: '#3b82f6' })
    }
  }, [open, category, reset])

  async function onSubmit(data: CategoryCreate) {
    try {
      if (isEditMode && category) {
        await updateCategory({ id: category.id, data })
        toast.success('Categoria atualizada!')
      } else {
        await createCategory(data)
        toast.success('Categoria criada!')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar categoria')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input id="cat-name" placeholder="Ex: Trabalho, Pessoal..." {...register('name')} />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Cor</Label>
            <div className="flex items-center gap-3">
              <span
                className="h-6 w-6 rounded-full border shadow-sm"
                style={{ backgroundColor: watchedColor }}
              />
              <span className="text-xs text-muted-foreground font-mono">{watchedColor}</span>
            </div>
            <CategoryColorPicker
              value={watchedColor}
              onChange={(c) => setValue('color', c)}
            />
          </div>

          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
