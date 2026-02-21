'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupFormData } from '@/lib/schemas/auth.schema'
import { useSignup } from '../hooks/useSignup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignupForm() {
  const { signup, errorMessage, isLoading } = useSignup()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const submitting = isSubmitting || isLoading

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Criar conta</h1>
        <p className="text-sm text-gray-500 mt-1">Comece a organizar suas tarefas</p>
      </div>

      <form onSubmit={handleSubmit(signup)} className="space-y-4" noValidate>
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
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {errorMessage && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg" role="alert">
            {errorMessage}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Já tem conta?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </div>
  )
}
