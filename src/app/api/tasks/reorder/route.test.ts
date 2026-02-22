import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockChain = {
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
  catch: vi.fn(),
}
const mockFrom = vi.fn().mockReturnValue(mockChain)

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

describe('PATCH /api/tasks/reorder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue(mockChain)
  })

  it('retorna 401 quando usuário não está autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const { PATCH } = await import('./route')
    const request = new Request('http://localhost/api/tasks/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: '123e4567-e89b-12d3-a456-426614174000', position: 1000 }] }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(401)
  })

  it('retorna 400 quando items está vazio', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

    const { PATCH } = await import('./route')
    const request = new Request('http://localhost/api/tasks/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })

  it('retorna 400 quando id não é UUID válido', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

    const { PATCH } = await import('./route')
    const request = new Request('http://localhost/api/tasks/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'nao-e-uuid', position: 1000 }] }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })

  it('retorna 204 com items válidos', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

    const { PATCH } = await import('./route')
    const request = new Request('http://localhost/api/tasks/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: '123e4567-e89b-12d3-a456-426614174000', position: 1000 }],
      }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(204)
  })
})
