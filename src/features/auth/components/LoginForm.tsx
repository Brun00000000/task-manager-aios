'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth.schema'
import { useLogin } from '../hooks/useLogin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const { login, errorMessage, isLoading } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const submitting = isSubmitting || isLoading

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Entrar</h1>
        <p className="text-sm text-gray-500 mt-1">Acesse seu gerenciador de tarefas</p>
      </div>

      <form onSubmit={handleSubmit(login)} className="space-y-4" noValidate>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {errorMessage && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg" role="alert">
            {errorMessage}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Não tem conta?{' '}
        <Link href="/signup" className="text-blue-600 hover:underline font-medium">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
