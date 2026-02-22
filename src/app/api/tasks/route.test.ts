import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.fn()
const mockChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  not: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn(),
  then: (resolve: (v: unknown) => unknown) => resolve({ data: [], count: 0, error: null }),
  catch: vi.fn(),
}
const mockFrom = vi.fn().mockReturnValue(mockChain)

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

describe('GET /api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue(mockChain)
  })

  it('retorna 401 quando usuário não está autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost/api/tasks')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error.message).toBe('Unauthorized')
  })

  it('retorna 200 com lista vazia quando autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost/api/tasks')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('meta')
  })
})

describe('POST /api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 401 quando usuário não está autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const { POST } = await import('./route')
    const request = new NextRequest('http://localhost/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Nova tarefa' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('retorna 400 quando body é inválido', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

    const { POST } = await import('./route')
    const request = new NextRequest('http://localhost/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'AB' }), // título muito curto
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})
