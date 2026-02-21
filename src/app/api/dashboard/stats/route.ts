import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaskRepository } from '@/lib/repositories/TaskRepository'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const repo = new TaskRepository(supabase)
    const stats = await repo.getDashboardStats(user.id)
    return NextResponse.json({ data: stats })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
