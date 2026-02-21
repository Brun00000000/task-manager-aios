import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { TaskCreate, TaskQuery } from '@/features/tasks/schemas/task.schema'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface CategorySummary {
  id: string
  name: string
  color: string
}

export interface TaskSummary {
  id: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  position: number
  deleted_at: string | null
  created_at: string
  updated_at: string
  categories: CategorySummary[]
}

export interface TaskListResult {
  tasks: TaskSummary[]
  total: number
  page: number
  limit: number
}

type SupabaseDb = SupabaseClient<Database>

export class TaskRepository {
  constructor(private supabase: SupabaseDb) {}

  async list(userId: string, query: TaskQuery): Promise<TaskListResult> {
    const { page, limit, status, priority, category_id, due, search } = query
    const offset = (page - 1) * limit

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const weekEndStr = weekEnd.toISOString().split('T')[0]

    // Build base query
    let q = this.supabase
      .from('tasks')
      .select(
        `id, title, description, priority, status, due_date, position, deleted_at, created_at, updated_at,
         task_categories(category_id, categories(id, name, color))`,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('position', { ascending: true })
      .range(offset, offset + limit - 1)

    if (status) q = q.eq('status', status)
    if (priority) q = q.eq('priority', priority)
    if (search) q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

    if (due === 'today') {
      q = q.eq('due_date', todayStr).neq('status', 'done')
    } else if (due === 'week') {
      q = q.gte('due_date', todayStr).lte('due_date', weekEndStr).neq('status', 'done')
    } else if (due === 'overdue') {
      q = q.lt('due_date', todayStr).neq('status', 'done')
    } else if (due === 'none') {
      q = q.is('due_date', null)
    }

    if (category_id) {
      const { data: taskIds } = await this.supabase
        .from('task_categories')
        .select('task_id')
        .eq('category_id', category_id)
      if (taskIds) {
        q = q.in('id', taskIds.map((r) => r.task_id))
      }
    }

    const { data, count, error } = await q

    if (error) throw new Error(`TaskRepository.list failed: ${error.message}`)

    const tasks: TaskSummary[] = (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority as TaskPriority,
      status: row.status as TaskStatus,
      due_date: row.due_date,
      position: row.position,
      deleted_at: row.deleted_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      categories: (row.task_categories ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((tc: any) => tc.categories)
        .filter(Boolean) as CategorySummary[],
    }))

    return { tasks, total: count ?? 0, page, limit }
  }

  async create(userId: string, data: TaskCreate): Promise<TaskSummary> {
    // Get max position for user
    const { data: maxRow } = await this.supabase
      .from('tasks')
      .select('position')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const nextPosition = maxRow ? maxRow.position + 1000 : 1000

    const { data: task, error } = await this.supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description ?? null,
        due_date: data.due_date ?? null,
        priority: data.priority,
        status: data.status,
        position: nextPosition,
      })
      .select('id')
      .single()

    if (error || !task) throw new Error(`TaskRepository.create failed: ${error?.message}`)

    const taskId = (task as { id: string }).id

    // Associate categories
    if (data.category_ids && data.category_ids.length > 0) {
      const { error: catErr } = await this.supabase.from('task_categories').insert(
        data.category_ids.map((category_id) => ({ task_id: taskId, category_id }))
      )
      if (catErr) throw new Error(`TaskRepository.create categories failed: ${catErr.message}`)
    }

    // Return with categories
    const result = await this.getById(userId, taskId)
    if (!result) throw new Error('Task created but not found')
    return result
  }

  async getById(userId: string, id: string): Promise<TaskSummary | null> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select(
        `id, title, description, priority, status, due_date, position, deleted_at, created_at, updated_at,
         task_categories(category_id, categories(id, name, color))`
      )
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority as TaskPriority,
      status: data.status as TaskStatus,
      due_date: data.due_date,
      position: data.position,
      deleted_at: data.deleted_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      categories: (data.task_categories ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((tc: any) => tc.categories)
        .filter(Boolean) as CategorySummary[],
    }
  }
}
