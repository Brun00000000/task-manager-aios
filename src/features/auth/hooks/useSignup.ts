'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AuthError } from '@supabase/supabase-js'
import type { SignupFormData } from '@/lib/schemas/auth.schema'

function mapAuthError(error: AuthError): string {
  const msg = error.message.toLowerCase()
  if (msg.includes('user already registered') || msg.includes('email already registered'))
    return 'Este email já está cadastrado'
  if (msg.includes('password should be at least')) return 'Senha deve ter no mínimo 8 caracteres'
  if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.'
  return 'Ocorreu um erro. Tente novamente.'
}

export function useSignup() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function signup(data: SignupFormData) {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
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
    } catch {
      setErrorMessage('Ocorreu um erro. Tente novamente.')
      setIsLoading(false)
    }
  }

  return { signup, errorMessage, isLoading }
}
