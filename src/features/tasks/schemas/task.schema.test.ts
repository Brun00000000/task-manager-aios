import { describe, it, expect } from 'vitest'
import { taskCreateSchema, taskUpdateSchema, taskQuerySchema } from './task.schema'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'

describe('taskCreateSchema', () => {
  it('valida tarefa com todos os campos', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Minha tarefa',
      description: 'Descrição da tarefa',
      due_date: '2026-12-31',
      priority: 'high',
      status: 'todo',
      category_ids: [VALID_UUID],
    })
    expect(result.success).toBe(true)
  })

  it('valida tarefa com apenas título (campos opcionais ausentes)', () => {
    const result = taskCreateSchema.safeParse({ title: 'Tarefa mínima' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.priority).toBe('medium')
      expect(result.data.status).toBe('todo')
      expect(result.data.category_ids).toEqual([])
    }
  })

  it('rejeita título vazio', () => {
    const result = taskCreateSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita título com menos de 3 caracteres', () => {
    const result = taskCreateSchema.safeParse({ title: 'AB' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Título deve ter pelo menos 3 caracteres')
    }
  })

  it('rejeita título com mais de 255 caracteres', () => {
    const result = taskCreateSchema.safeParse({ title: 'A'.repeat(256) })
    expect(result.success).toBe(false)
  })

  it('rejeita prioridade inválida', () => {
    const result = taskCreateSchema.safeParse({ title: 'Tarefa', priority: 'critical' })
    expect(result.success).toBe(false)
  })

  it('aceita todas as prioridades válidas', () => {
    for (const priority of ['low', 'medium', 'high', 'urgent']) {
      const result = taskCreateSchema.safeParse({ title: 'Tarefa', priority })
      expect(result.success).toBe(true)
    }
  })

  it('rejeita status inválido', () => {
    const result = taskCreateSchema.safeParse({ title: 'Tarefa', status: 'completed' })
    expect(result.success).toBe(false)
  })

  it('aceita todos os status válidos', () => {
    for (const status of ['todo', 'in_progress', 'done']) {
      const result = taskCreateSchema.safeParse({ title: 'Tarefa', status })
      expect(result.success).toBe(true)
    }
  })

  it('rejeita mais de 5 categorias', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Tarefa',
      category_ids: Array.from({ length: 6 }, () => VALID_UUID),
    })
    expect(result.success).toBe(false)
  })

  it('rejeita UUID inválido em category_ids', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Tarefa',
      category_ids: ['nao-e-um-uuid'],
    })
    expect(result.success).toBe(false)
  })

  it('aceita description nula', () => {
    const result = taskCreateSchema.safeParse({ title: 'Tarefa', description: null })
    expect(result.success).toBe(true)
  })

  it('rejeita description com mais de 2000 caracteres', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Tarefa',
      description: 'A'.repeat(2001),
    })
    expect(result.success).toBe(false)
  })
})

describe('taskUpdateSchema', () => {
  it('aceita objeto vazio (todos os campos opcionais)', () => {
    const result = taskUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('aceita atualização parcial — apenas status', () => {
    const result = taskUpdateSchema.safeParse({ status: 'done' })
    expect(result.success).toBe(true)
  })

  it('aceita atualização parcial — apenas priority', () => {
    const result = taskUpdateSchema.safeParse({ priority: 'urgent' })
    expect(result.success).toBe(true)
  })

  it('rejeita título inválido mesmo em update parcial', () => {
    const result = taskUpdateSchema.safeParse({ title: 'AB' })
    expect(result.success).toBe(false)
  })
})

describe('taskQuerySchema', () => {
  it('aplica valores padrão quando params ausentes', () => {
    const result = taskQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('coerce strings para números', () => {
    const result = taskQuerySchema.safeParse({ page: '2', limit: '10' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.limit).toBe(10)
    }
  })

  it('rejeita page menor que 1', () => {
    const result = taskQuerySchema.safeParse({ page: '0' })
    expect(result.success).toBe(false)
  })

  it('rejeita limit maior que 100', () => {
    const result = taskQuerySchema.safeParse({ limit: '101' })
    expect(result.success).toBe(false)
  })

  it('aceita filtros válidos', () => {
    const result = taskQuerySchema.safeParse({
      status: 'in_progress',
      priority: 'high',
      due: 'overdue',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita status inválido no query', () => {
    const result = taskQuerySchema.safeParse({ status: 'archived' })
    expect(result.success).toBe(false)
  })

  it('rejeita due inválido', () => {
    const result = taskQuerySchema.safeParse({ due: 'yesterday' })
    expect(result.success).toBe(false)
  })

  it('aceita category_id como UUID', () => {
    const result = taskQuerySchema.safeParse({ category_id: VALID_UUID })
    expect(result.success).toBe(true)
  })

  it('rejeita category_id inválido', () => {
    const result = taskQuerySchema.safeParse({ category_id: 'nao-e-uuid' })
    expect(result.success).toBe(false)
  })
})
