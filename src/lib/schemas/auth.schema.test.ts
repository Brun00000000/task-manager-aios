import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema } from './auth.schema'

describe('loginSchema', () => {
  it('valida dados corretos', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '123456' })
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const result = loginSchema.safeParse({ email: 'nao-e-email', password: '123456' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email inválido')
    }
  })

  it('rejeita senha vazia', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha obrigatória')
    }
  })
})

describe('signupSchema', () => {
  it('valida dados corretos', () => {
    const result = signupSchema.safeParse({
      email: 'test@example.com',
      password: 'minhasenha123',
      confirmPassword: 'minhasenha123',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const result = signupSchema.safeParse({
      email: 'invalido',
      password: 'minhasenha123',
      confirmPassword: 'minhasenha123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email inválido')
    }
  })

  it('rejeita senha curta (< 8 chars)', () => {
    const result = signupSchema.safeParse({
      email: 'test@example.com',
      password: 'curta',
      confirmPassword: 'curta',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha deve ter no mínimo 8 caracteres')
    }
  })

  it('rejeita senhas que não coincidem', () => {
    const result = signupSchema.safeParse({
      email: 'test@example.com',
      password: 'minhasenha123',
      confirmPassword: 'outrasenha456',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('As senhas não coincidem')
      expect(result.error.issues[0].path).toContain('confirmPassword')
    }
  })
})
