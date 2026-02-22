import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskRepository } from './TaskRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type SupabaseDb = SupabaseClient<Database>

// Creates a chainable mock that is also thenable (awaitable)
function createChain(resolveWith: Record<string, unknown> = { data: null, error: null, count: 0 }) {
  const thenable = Promise.resolve(resolveWith)
  const chain: Record<string, unknown> = {}

  for (const method of [
    'select', 'eq', 'is', 'not', 'neq', 'or', 'order', 'range',
    'limit', 'in', 'gt', 'lt', 'gte', 'lte',
    'update', 'insert', 'delete',
  ]) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }

  chain['single'] = vi.fn().mockReturnValue(thenable)
  chain['then'] = thenable.then.bind(thenable)
  chain['catch'] = thenable.catch.bind(thenable)

  return chain
}

function createSupabase(queryResult: Record<string, unknown> = { data: null, error: null, count: 0 }) {
  const chain = createChain(queryResult)
  return {
    chain,
    supabase: {
      from: vi.fn().mockReturnValue(chain),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
        updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
    },
  }
}

// ─── reorder ────────────────────────────────────────────────────────────────

describe('TaskRepository.reorder', () => {
  it('chama from("tasks") para cada item', async () => {
    const { chain, supabase } = createSupabase()
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    await repo.reorder('user-1', [
      { id: 'task-a', position: 1000 },
      { id: 'task-b', position: 2000 },
    ])

    expect(supabase.from).toHaveBeenCalledTimes(2)
    expect(supabase.from).toHaveBeenCalledWith('tasks')
    expect(chain.update).toHaveBeenCalledTimes(2)
  })

  it('passa position e user_id corretos no update', async () => {
    const { chain, supabase } = createSupabase()
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    await repo.reorder('user-x', [{ id: 'task-1', position: 5000 }])

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ position: 5000 })
    )
    expect(chain.eq).toHaveBeenCalledWith('id', 'task-1')
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-x')
  })

  it('não lança erro com lista vazia', async () => {
    const { supabase } = createSupabase()
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    await expect(repo.reorder('user-1', [])).resolves.toBeUndefined()
    expect(supabase.from).not.toHaveBeenCalled()
  })
})

// ─── softDelete ─────────────────────────────────────────────────────────────

describe('TaskRepository.softDelete', () => {
  it('atualiza deleted_at da tarefa', async () => {
    const { chain, supabase } = createSupabase({ data: null, error: null })
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    await repo.softDelete('user-1', 'task-1')

    expect(supabase.from).toHaveBeenCalledWith('tasks')
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ deleted_at: expect.any(String) })
    )
    expect(chain.eq).toHaveBeenCalledWith('id', 'task-1')
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('lança erro quando Supabase retorna error', async () => {
    const { supabase } = createSupabase({ data: null, error: { message: 'RLS violation' } })
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    await expect(repo.softDelete('user-1', 'task-1')).rejects.toThrow(
      'TaskRepository.softDelete failed: RLS violation'
    )
  })
})

// ─── restore ────────────────────────────────────────────────────────────────

describe('TaskRepository.restore', () => {
  it('limpa deleted_at e retorna a tarefa restaurada', async () => {
    const mockTask = {
      id: 'task-1',
      title: 'Tarefa',
      description: null,
      priority: 'medium',
      status: 'todo',
      due_date: null,
      position: 1000,
      deleted_at: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      task_categories: [],
    }

    const { chain, supabase } = createSupabase({ data: null, error: null })
    // getById chain (called after restore) resolves with mockTask
    chain['single'] = vi.fn().mockResolvedValue({ data: mockTask, error: null })
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    const result = await repo.restore('user-1', 'task-1')

    expect(chain.update).toHaveBeenCalledWith({ deleted_at: null })
    expect(result.id).toBe('task-1')
    expect(result.deleted_at).toBeNull()
  })

  it('lança erro quando update falha', async () => {
    const { supabase } = createSupabase({ data: null, error: { message: 'not found' } })
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    await expect(repo.restore('user-1', 'task-1')).rejects.toThrow(
      'TaskRepository.restore failed: not found'
    )
  })
})

// ─── list ───────────────────────────────────────────────────────────────────

describe('TaskRepository.list', () => {
  it('retorna tasks e metadados de paginação', async () => {
    const mockRow = {
      id: 'task-1',
      title: 'Tarefa',
      description: null,
      priority: 'medium',
      status: 'todo',
      due_date: null,
      position: 1000,
      deleted_at: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      task_categories: [],
    }

    const { supabase } = createSupabase({ data: [mockRow], count: 1, error: null })
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    const result = await repo.list('user-1', { page: 1, limit: 20 })

    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.tasks).toHaveLength(1)
    expect(result.tasks[0].id).toBe('task-1')
  })

  it('lança erro quando query falha', async () => {
    const { supabase } = createSupabase({ data: null, count: null, error: { message: 'query error' } })
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    await expect(repo.list('user-1', { page: 1, limit: 20 })).rejects.toThrow(
      'TaskRepository.list failed: query error'
    )
  })

  it('mapeia task_categories para categories array', async () => {
    const mockRow = {
      id: 'task-1',
      title: 'Tarefa',
      description: null,
      priority: 'high',
      status: 'in_progress',
      due_date: '2026-12-31',
      position: 1000,
      deleted_at: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      task_categories: [
        { category_id: 'cat-1', categories: { id: 'cat-1', name: 'Trabalho', color: '#3b82f6' } },
      ],
    }

    const { supabase } = createSupabase({ data: [mockRow], count: 1, error: null })
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    const result = await repo.list('user-1', { page: 1, limit: 20 })

    expect(result.tasks[0].categories).toHaveLength(1)
    expect(result.tasks[0].categories[0].name).toBe('Trabalho')
  })
})

// ─── getById ────────────────────────────────────────────────────────────────

describe('TaskRepository.getById', () => {
  it('retorna null quando tarefa não é encontrada', async () => {
    const { supabase } = createSupabase({ data: null, error: { message: 'not found' } })
    const repo = new TaskRepository(supabase as unknown as SupabaseDb)

    const result = await repo.getById('user-1', 'task-inexistente')

    expect(result).toBeNull()
  })
})
