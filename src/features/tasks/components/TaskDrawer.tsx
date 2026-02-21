'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { z } from 'zod'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { taskCreateSchema, type TaskCreate } from '@/features/tasks/schemas/task.schema'

type TaskCreateInput = z.input<typeof taskCreateSchema>
import { useCreateTask } from '@/features/tasks/hooks/useCreateTask'

interface Category {
  id: string
  name: string
  color: string
}

interface TaskDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDrawer({ open, onOpenChange }: TaskDrawerProps) {
  const { mutateAsync: createTask, isPending } = useCreateTask()

  const { data: categoriesData } = useQuery<{ data: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
    enabled: open,
  })
  const categories = categoriesData?.data ?? []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskCreateInput, unknown, TaskCreate>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      priority: 'medium',
      status: 'todo',
      category_ids: [],
    },
  })

  const selectedCategoryIds = watch('category_ids') ?? []

  function toggleCategory(id: string) {
    const current = selectedCategoryIds
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : current.length < 5
      ? [...current, id]
      : current
    setValue('category_ids', next)
  }

  async function onSubmit(data: TaskCreate) {
    try {
      await createTask(data)
      toast.success('Tarefa criada com sucesso!')
      reset()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar tarefa')
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova Tarefa</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 py-6">
          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Descreva a tarefa..."
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Detalhes adicionais (opcional)"
              rows={3}
              {...register('description')}
            />
          </div>

          {/* Prazo */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="due_date">Prazo</Label>
            <Input
              id="due_date"
              type="date"
              {...register('due_date')}
            />
          </div>

          {/* Prioridade */}
          <div className="flex flex-col gap-1.5">
            <Label>Prioridade</Label>
            <Select
              defaultValue="medium"
              onValueChange={(val) =>
                setValue('priority', val as TaskCreate['priority'])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categorias */}
          {categories.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>
                Categorias{' '}
                <span className="text-xs text-muted-foreground">(máx. 5)</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = selectedCategoryIds.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
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
            </div>
          )}

          <SheetFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar tarefa'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
