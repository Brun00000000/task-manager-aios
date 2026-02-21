import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CategoryRepository } from '@/lib/repositories/CategoryRepository'
import { categoryCreateSchema } from '@/features/categories/schemas/category.schema'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  try {
    const repo = new CategoryRepository(supabase)
    const categories = await repo.list(user.id)
    return NextResponse.json({ data: categories })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: { message } }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = categoryCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: 'Validation error', issues: parsed.error.issues } },
      { status: 422 }
    )
  }

  try {
    const repo = new CategoryRepository(supabase)
    const category = await repo.create(user.id, parsed.data)
    return NextResponse.json({ data: category }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: { message } }, { status: 500 })
  }
}
