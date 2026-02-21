'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '../store/auth.store'

export function useAuthUser() {
  const { user, isLoading, setUser, clearUser } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Carrega o usuário atual na inicialização
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email ?? '',
          fullName: currentUser.user_metadata?.full_name ?? null,
        })
      } else {
        clearUser()
      }
    })

    // Escuta mudanças de auth em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: session.user.user_metadata?.full_name ?? null,
        })
      } else {
        clearUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, clearUser])

  return { user, isLoading }
}
