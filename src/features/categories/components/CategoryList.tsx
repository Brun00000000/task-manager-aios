'use client'

import { useState } from 'react'
import { Pencil, Trash2, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CategoryForm } from './CategoryForm'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useDeleteCategory } from '@/features/categories/hooks/useDeleteCategory'
import type { CategoryWithCount } from '@/lib/repositories/CategoryRepository'

export function CategoryList() {
  const { data, isLoading } = useCategories()
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory()
  const categories = data?.data ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithCount | null>(null)
  const [deleteConflict, setDeleteConflict] = useState<{ category: CategoryWithCount; task_count: number } | null>(null)

  function openCreate() {
    setEditingCategory(null)
    setFormOpen(true)
  }

  function openEdit(cat: CategoryWithCount) {
    setEditingCategory(cat)
    setFormOpen(true)
  }

  function handleDeleteClick(cat: CategoryWithCount) {
    if (cat.task_count > 0) {
      setDeleteConflict({ category: cat, task_count: cat.task_count })
    } else {
      setDeleteTarget(cat)
    }
  }

  function confirmDelete(cat: CategoryWithCount) {
    deleteCategory(cat.id, {
      onSuccess: () => toast.success(`Categoria "${cat.name}" excluída`),
      onError: (err) => {
        const e = err as Error & { task_count?: number }
        if (e.task_count && e.task_count > 0) {
          setDeleteConflict({ category: cat, task_count: e.task_count })
        } else {
          toast.error(e.message)
        }
      },
    })
    setDeleteTarget(null)
  }

  function confirmForceDelete(cat: CategoryWithCount) {
    deleteCategory(cat.id, {
      onSuccess: () => toast.success(`Categoria "${cat.name}" excluída (${deleteConflict?.task_count} associações removidas)`),
      onError: (err) => toast.error((err as Error).message),
    })
    setDeleteConflict(null)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card py-14 text-center">
        <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
        <div>
          <p className="font-medium">Nenhuma categoria</p>
          <p className="text-sm text-muted-foreground">Crie categorias para organizar suas tarefas</p>
        </div>
        <Button onClick={openCreate}>Criar primeira categoria</Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium truncate">{cat.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {cat.task_count} {cat.task_count === 1 ? 'tarefa' : 'tarefas'}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => openEdit(cat)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:text-destructive"
                disabled={isDeleting}
                onClick={() => handleDeleteClick(cat)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
      />

      {/* Confirmação de exclusão simples */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong> será excluída permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && confirmDelete(deleteTarget)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de exclusão com tarefas associadas */}
      <AlertDialog open={!!deleteConflict} onOpenChange={(o) => !o && setDeleteConflict(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Categoria com tarefas associadas</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria <strong>&ldquo;{deleteConflict?.category.name}&rdquo;</strong> está associada a{' '}
              <strong>{deleteConflict?.task_count} {deleteConflict?.task_count === 1 ? 'tarefa' : 'tarefas'}</strong>.
              Ao excluir, as associações serão removidas e as tarefas ficarão sem esta categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConflict && confirmForceDelete(deleteConflict.category)}
            >
              Excluir mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
