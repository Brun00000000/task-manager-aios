import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaskRepository } from '@/lib/repositories/TaskRepository'
import { taskCreateSchema, taskQuerySchema } from '@/features/tasks/schemas/task.schema'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })

  const { searchParams } = request.nextUrl
  const rawQuery = Object.fromEntries(searchParams.entries())

  const parsed = taskQuerySchema.safeParse(rawQuery)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid query', details: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    )
  }

  const repo = new TaskRepository(supabase)
  const result = await repo.list(user.id, parsed.data)

  return NextResponse.json({ data: result.tasks, meta: { total: result.total, page: result.page, limit: result.limit } })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } }, { status: 400 })

  const parsed = taskCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid task data', details: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    )
  }

  const repo = new TaskRepository(supabase)
  const task = await repo.create(user.id, parsed.data)

  return NextResponse.json({ data: task }, { status: 201 })
}
