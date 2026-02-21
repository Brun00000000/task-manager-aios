import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaskRepository } from '@/lib/repositories/TaskRepository'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  try {
    const repo = new TaskRepository(supabase)
    const task = await repo.restore(user.id, id)
    return NextResponse.json({ data: task })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: { message } }, { status: 500 })
  }
}
