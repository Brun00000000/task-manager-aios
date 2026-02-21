'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '../store/auth.store'

export function useLogout() {
  const router = useRouter()
  const clearUser = useAuthStore((s) => s.clearUser)

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    clearUser()
    router.push('/login')
    router.refresh()
  }

  return { logout }
}
