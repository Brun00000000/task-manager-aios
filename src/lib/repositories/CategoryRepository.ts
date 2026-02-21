import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { CategoryCreate, CategoryUpdate } from '@/features/categories/schemas/category.schema'

export interface CategoryWithCount {
  id: string
  name: string
  color: string
  task_count: number
  created_at: string
}

type SupabaseDb = SupabaseClient<Database>

export class CategoryRepository {
  constructor(private supabase: SupabaseDb) {}

  async list(userId: string): Promise<CategoryWithCount[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('id, name, color, created_at')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) throw new Error(`CategoryRepository.list failed: ${error.message}`)

    if (!data || data.length === 0) return []

    // Get task counts for each category (only non-deleted tasks)
    const ids = data.map((c) => c.id)
    const { data: counts, error: countErr } = await this.supabase
      .from('task_categories')
      .select('category_id, tasks!inner(id, deleted_at)')
      .in('category_id', ids)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .is('tasks.deleted_at' as any, null)

    if (countErr) throw new Error(`CategoryRepository.list count failed: ${countErr.message}`)

    const countMap: Record<string, number> = {}
    ;(counts ?? []).forEach((row) => {
      countMap[row.category_id] = (countMap[row.category_id] ?? 0) + 1
    })

    return data.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      created_at: c.created_at,
      task_count: countMap[c.id] ?? 0,
    }))
  }

  async create(userId: string, data: CategoryCreate): Promise<CategoryWithCount> {
    const { data: category, error } = await this.supabase
      .from('categories')
      .insert({ user_id: userId, name: data.name, color: data.color })
      .select('id, name, color, created_at')
      .single()

    if (error || !category) throw new Error(`CategoryRepository.create failed: ${error?.message}`)

    return { ...category, task_count: 0 }
  }

  async update(userId: string, id: string, data: CategoryUpdate): Promise<CategoryWithCount> {
    const { error } = await this.supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(`CategoryRepository.update failed: ${error.message}`)

    const updated = await this.list(userId)
    const result = updated.find((c) => c.id === id)
    if (!result) throw new Error('Category not found after update')
    return result
  }

  async getTaskCount(id: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('task_categories')
      .select('task_id', { count: 'exact', head: true })
      .eq('category_id', id)

    if (error) throw new Error(`CategoryRepository.getTaskCount failed: ${error.message}`)
    return count ?? 0
  }

  async delete(userId: string, id: string): Promise<void> {
    // Remove task associations first
    await this.supabase.from('task_categories').delete().eq('category_id', id)

    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(`CategoryRepository.delete failed: ${error.message}`)
  }
}
