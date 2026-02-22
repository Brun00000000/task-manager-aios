import { describe, it, expect } from 'vitest'
import { categoryCreateSchema, categoryUpdateSchema, CATEGORY_COLORS } from './category.schema'

const VALID_COLOR = CATEGORY_COLORS[0].value // '#ef4444'

describe('categoryCreateSchema', () => {
  it('valida categoria com nome e cor válidos', () => {
    const result = categoryCreateSchema.safeParse({ name: 'Trabalho', color: VALID_COLOR })
    expect(result.success).toBe(true)
  })

  it('rejeita nome com menos de 2 caracteres', () => {
    const result = categoryCreateSchema.safeParse({ name: 'A', color: VALID_COLOR })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome deve ter pelo menos 2 caracteres')
    }
  })

  it('rejeita nome vazio', () => {
    const result = categoryCreateSchema.safeParse({ name: '', color: VALID_COLOR })
    expect(result.success).toBe(false)
  })

  it('rejeita nome com mais de 50 caracteres', () => {
    const result = categoryCreateSchema.safeParse({ name: 'A'.repeat(51), color: VALID_COLOR })
    expect(result.success).toBe(false)
  })

  it('aceita todas as cores da paleta', () => {
    for (const { value } of CATEGORY_COLORS) {
      const result = categoryCreateSchema.safeParse({ name: 'Categoria', color: value })
      expect(result.success).toBe(true)
    }
  })

  it('rejeita cor fora da paleta', () => {
    const result = categoryCreateSchema.safeParse({ name: 'Categoria', color: '#ffffff' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Cor inválida')
    }
  })

  it('rejeita cor vazia', () => {
    const result = categoryCreateSchema.safeParse({ name: 'Categoria', color: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita cor como número', () => {
    const result = categoryCreateSchema.safeParse({ name: 'Categoria', color: 123 })
    expect(result.success).toBe(false)
  })

  it('rejeita campos ausentes', () => {
    expect(categoryCreateSchema.safeParse({}).success).toBe(false)
    expect(categoryCreateSchema.safeParse({ name: 'Trabalho' }).success).toBe(false)
    expect(categoryCreateSchema.safeParse({ color: VALID_COLOR }).success).toBe(false)
  })
})

describe('categoryUpdateSchema', () => {
  it('aceita objeto vazio (todos os campos opcionais)', () => {
    const result = categoryUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('aceita atualização apenas do nome', () => {
    const result = categoryUpdateSchema.safeParse({ name: 'Pessoal' })
    expect(result.success).toBe(true)
  })

  it('aceita atualização apenas da cor', () => {
    const result = categoryUpdateSchema.safeParse({ color: VALID_COLOR })
    expect(result.success).toBe(true)
  })

  it('rejeita nome inválido mesmo em update parcial', () => {
    const result = categoryUpdateSchema.safeParse({ name: 'X' })
    expect(result.success).toBe(false)
  })

  it('rejeita cor inválida mesmo em update parcial', () => {
    const result = categoryUpdateSchema.safeParse({ color: '#000000' })
    expect(result.success).toBe(false)
  })
})
