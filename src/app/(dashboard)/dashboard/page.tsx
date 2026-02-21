import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-1">
        Bem-vindo, <strong>{user?.email}</strong>
      </p>
      <p className="text-sm text-gray-400">Gestão de tarefas — em breve</p>
    </div>
  )
}
