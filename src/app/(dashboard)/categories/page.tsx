'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryList } from '@/features/categories/components/CategoryList'
import { CategoryForm } from '@/features/categories/components/CategoryForm'

export default function CategoriesPage() {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Organize suas tarefas por contexto ou projeto
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <CategoryList />

      <CategoryForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
