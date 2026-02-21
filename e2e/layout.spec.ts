import { test, expect } from '@playwright/test'

// Helper para autenticar antes dos testes de layout
async function loginUser(page: any) {
  // Usa as credenciais de teste do seed
  await page.goto('/login')
  await page.getByLabel('Email').fill('alice@example.com')
  await page.getByLabel('Senha').fill('password123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
}

test.describe('Layout — Desktop (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('sidebar visível no desktop', async ({ page }) => {
    await loginUser(page)
    await expect(page.locator('aside')).toBeVisible()
    await expect(page.getByText('Task Manager')).toBeVisible()
  })

  test('links de navegação presentes na sidebar', async ({ page }) => {
    await loginUser(page)
    await expect(page.locator('aside').getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.locator('aside').getByRole('link', { name: 'Tarefas' })).toBeVisible()
    await expect(page.locator('aside').getByRole('link', { name: 'Categorias' })).toBeVisible()
    await expect(page.locator('aside').getByRole('link', { name: 'Configurações' })).toBeVisible()
  })

  test('header exibe email do usuário', async ({ page }) => {
    await loginUser(page)
    await expect(page.locator('header')).toBeVisible()
    await expect(page.getByText('alice@example.com')).toBeVisible()
  })

  test('bottom nav oculta no desktop', async ({ page }) => {
    await loginUser(page)
    const bottomNav = page.locator('nav.md\:hidden')
    await expect(bottomNav).toBeHidden()
  })
})

test.describe('Layout — Mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('sidebar oculta no mobile', async ({ page }) => {
    await loginUser(page)
    await expect(page.locator('aside')).toBeHidden()
  })

  test('bottom nav visível no mobile', async ({ page }) => {
    await loginUser(page)
    await expect(page.locator('nav').filter({ hasText: 'Dashboard' })).toBeVisible()
  })
})

test.describe('Layout — Navegação', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('link Dashboard ativo em /dashboard', async ({ page }) => {
    await loginUser(page)
    const dashLink = page.locator('aside').getByRole('link', { name: 'Dashboard' })
    await expect(dashLink).toHaveClass(/text-blue-700/)
  })
})

test.describe('Página 404', () => {
  test('rota inexistente exibe página 404', async ({ page }) => {
    await page.goto('/rota-que-nao-existe')
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText('Página não encontrada')).toBeVisible()
  })
})
