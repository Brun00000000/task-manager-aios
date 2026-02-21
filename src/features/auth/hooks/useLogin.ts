'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AuthError } from '@supabase/supabase-js'
import type { LoginFormData } from '@/lib/schemas/auth.schema'

function mapAuthError(error: AuthError): string {
  const msg = error.message.toLowerCase()
  if (msg.includes('invalid login credentials')) return 'Email ou senha incorretos'
  if (msg.includes('email not confirmed')) return 'Confirme seu email antes de fazer login'
  if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.'
  return 'Ocorreu um erro. Tente novamente.'
}

export function useLogin() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function login(data: LoginFormData) {
    setIsLoading(true)
    setErrorMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setErrorMessage(mapAuthError(error))
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return { login, errorMessage, isLoading }
}
