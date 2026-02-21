import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaskRepository } from '@/lib/repositories/TaskRepository'
import { taskUpdateSchema } from '@/features/tasks/schemas/task.schema'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const repo = new TaskRepository(supabase)
  const task = await repo.getById(user.id, id)

  if (!task) {
    return NextResponse.json({ error: { message: 'Task not found' } }, { status: 404 })
  }

  return NextResponse.json({ data: task })
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = taskUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: 'Validation error', issues: parsed.error.issues } },
      { status: 422 }
    )
  }

  try {
    const repo = new TaskRepository(supabase)
    const task = await repo.update(user.id, id, parsed.data)
    return NextResponse.json({ data: task })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: { message } }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  try {
    const repo = new TaskRepository(supabase)
    await repo.softDelete(user.id, id)
    return NextResponse.json({ data: { id } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: { message } }, { status: 500 })
  }
}
