import { LayoutDashboard, CheckSquare, Tag, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { label: 'Categorias', href: '/categories', icon: Tag },
  { label: 'Configurações', href: '/settings', icon: Settings },
]
