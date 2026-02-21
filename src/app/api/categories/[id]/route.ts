import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CategoryRepository } from '@/lib/repositories/CategoryRepository'
import { categoryUpdateSchema } from '@/features/categories/schemas/category.schema'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = categoryUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: 'Validation error', issues: parsed.error.issues } },
      { status: 422 }
    )
  }

  try {
    const repo = new CategoryRepository(supabase)
    const category = await repo.update(user.id, id, parsed.data)
    return NextResponse.json({ data: category })
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
    const repo = new CategoryRepository(supabase)
    const taskCount = await repo.getTaskCount(id)

    if (taskCount > 0) {
      return NextResponse.json(
        { error: { message: 'Category has associated tasks', task_count: taskCount } },
        { status: 409 }
      )
    }

    await repo.delete(user.id, id)
    return NextResponse.json({ data: { id } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: { message } }, { status: 500 })
  }
}
