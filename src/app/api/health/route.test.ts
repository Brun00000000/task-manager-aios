import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('GET /api/health', () => {
  it('returns status ok with timestamp', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
    expect(typeof data.timestamp).toBe('string')
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
  })
})
