import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockChain = {
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: { full_name: 'João Silva' }, error: null }),
  then: (resolve: (v: unknown) => unknown) => resolve({ data: null, error: null }),
  catch: vi.fn(),
}
const mockFrom = vi.fn().mockReturnValue(mockChain)
const mockUpdateUser = vi.fn().mockResolvedValue({ data: {}, error: null })

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser, updateUser: mockUpdateUser },
    from: mockFrom,
  })),
}))

describe('PATCH /api/settings/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue(mockChain)
    mockUpdateUser.mockResolvedValue({ data: {}, error: null })
  })

  it('retorna 401 quando não autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const { PATCH } = await import('./route')
    const request = new Request('http://localhost/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'João Silva' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(401)
  })

  it('retorna 400 quando nome é inválido', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

    const { PATCH } = await import('./route')
    const request = new Request('http://localhost/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'A' }), // menos de 2 chars
    })
    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })

  it('retorna 200 com dados válidos', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

    const { PATCH } = await import('./route')
    const request = new Request('http://localhost/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'João Silva' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})

describe('GET /api/settings/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue(mockChain)
  })

  it('retorna 401 quando não autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const { GET } = await import('./route')
    const response = await GET()

    expect(response.status).toBe(401)
  })

  it('retorna perfil do usuário autenticado', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'test@example.com' } },
      error: null,
    })

    const { GET } = await import('./route')
    const response = await GET()

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('full_name')
    expect(body).toHaveProperty('email')
  })
})
