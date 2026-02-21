import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TrashList } from '@/features/tasks/components/TrashList'

export default function TrashPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lixeira</h1>
          <p className="text-sm text-muted-foreground">
            Tarefas excluídas nos últimos 30 dias
          </p>
        </div>
      </div>

      <TrashList />
    </div>
  )
}
