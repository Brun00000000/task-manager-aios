import { AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/features/settings/components/ProfileForm'
import { PasswordForm } from '@/features/settings/components/PasswordForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie suas informações de conta</p>
      </div>

      <ProfileForm
        initialName={profile?.full_name ?? ''}
        email={user?.email ?? ''}
      />

      <PasswordForm />

      <section className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
        <div className="mb-3 flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <h2 className="font-semibold">Zona de perigo</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          A exclusão da conta é permanente e remove todos os seus dados, incluindo tarefas e
          categorias. Esta ação não pode ser desfeita.
        </p>
        <p className="text-sm text-muted-foreground">
          Para solicitar a exclusão da sua conta, entre em contato pelo suporte.
        </p>
      </section>
    </div>
  )
}
