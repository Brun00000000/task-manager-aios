import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-card py-20 text-center">
      <ClipboardList className="h-12 w-12 text-muted-foreground/40" />
      <div>
        <p className="text-lg font-semibold">Nenhuma tarefa ainda</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie sua primeira tarefa para começar a acompanhar sua produtividade
        </p>
      </div>
      <Button asChild>
        <Link href="/tasks">Criar sua primeira tarefa</Link>
      </Button>
    </div>
  )
}
