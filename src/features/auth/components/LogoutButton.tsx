'use client'

import { useLogout } from '../hooks/useLogout'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const { logout } = useLogout()

  return (
    <Button variant="outline" size="sm" onClick={logout}>
      Sair
    </Button>
  )
}
