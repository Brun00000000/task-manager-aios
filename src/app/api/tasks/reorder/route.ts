import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { TaskRepository } from '@/lib/repositories/TaskRepository'

const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        position: z.number().int().positive(),
      })
    )
    .min(1),
})

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  const repo = new TaskRepository(supabase)
  await repo.reorder(user.id, parsed.data.items)

  return new NextResponse(null, { status: 204 })
}
