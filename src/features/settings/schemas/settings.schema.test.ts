import { describe, it, expect } from 'vitest'
import { profileSchema, passwordSchema } from './settings.schema'

describe('profileSchema', () => {
  it('valida nome completo válido', () => {
    const result = profileSchema.safeParse({ full_name: 'João Silva' })
    expect(result.success).toBe(true)
  })

  it('remove espaços extras (trim)', () => {
    const result = profileSchema.safeParse({ full_name: '  João  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.full_name).toBe('João')
    }
  })

  it('rejeita nome com menos de 2 caracteres', () => {
    const result = profileSchema.safeParse({ full_name: 'A' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome deve ter pelo menos 2 caracteres')
    }
  })

  it('rejeita nome vazio', () => {
    const result = profileSchema.safeParse({ full_name: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita nome com mais de 100 caracteres', () => {
    const result = profileSchema.safeParse({ full_name: 'A'.repeat(101) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome deve ter no máximo 100 caracteres')
    }
  })

  it('aceita nome com exatamente 2 caracteres', () => {
    const result = profileSchema.safeParse({ full_name: 'Jo' })
    expect(result.success).toBe(true)
  })

  it('aceita nome com exatamente 100 caracteres', () => {
    const result = profileSchema.safeParse({ full_name: 'A'.repeat(100) })
    expect(result.success).toBe(true)
  })
})

describe('passwordSchema', () => {
  it('valida senhas que coincidem e com comprimento mínimo', () => {
    const result = passwordSchema.safeParse({
      new_password: 'minhasenha123',
      confirm_password: 'minhasenha123',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita senha com menos de 6 caracteres', () => {
    const result = passwordSchema.safeParse({
      new_password: '12345',
      confirm_password: '12345',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha deve ter pelo menos 6 caracteres')
    }
  })

  it('rejeita senhas que não conferem', () => {
    const result = passwordSchema.safeParse({
      new_password: 'senha123',
      confirm_password: 'outrasenha',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senhas não conferem')
      expect(result.error.issues[0].path).toContain('confirm_password')
    }
  })

  it('aceita senha com exatamente 6 caracteres', () => {
    const result = passwordSchema.safeParse({
      new_password: '123456',
      confirm_password: '123456',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita quando confirm_password está vazio', () => {
    const result = passwordSchema.safeParse({
      new_password: 'minhasenha',
      confirm_password: '',
    })
    expect(result.success).toBe(false)
  })
})
