import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/features/auth/components/LogoutButton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? ''

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id ?? '')
    .single()

  const displayName = profile?.full_name || email
  const initials = (profile?.full_name ?? email).slice(0, 2).toUpperCase()

  return (
    <header className="h-14 border-b border-gray-100 bg-white px-4 flex items-center justify-between shrink-0">
      <span className="font-semibold text-gray-900 md:hidden">Task Manager</span>
      <div className="flex items-center gap-3 ml-auto">
        <span className="hidden sm:block text-sm text-gray-500">{displayName}</span>
        <Avatar className="h-8 w-8" aria-hidden="true">
          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{initials}</AvatarFallback>
        </Avatar>
        <LogoutButton />
      </div>
    </header>
  )
}
