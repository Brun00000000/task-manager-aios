import { test, expect, type Page } from '@playwright/test'

// Gera email único POR CHAMADA para evitar conflito entre testes sequenciais
// (o email era compartilhado entre todos os testes via layoutUser — o 2° signup falhava)
async function signUpAndLogin(page: Page): Promise<string> {
  const email = `test+layout+${Date.now()}@example.com`
  await page.goto('/signup')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('senha12345')
  await page.getByLabel('Confirmar senha').fill('senha12345')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  return email
}

test.describe('Layout — Desktop (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('sidebar visível no desktop', async ({ page }) => {
    await signUpAndLogin(page)
    await expect(page.locator('aside')).toBeVisible()
    await expect(page.getByText('Task Manager')).toBeVisible()
  })

  test('links de navegação presentes na sidebar', async ({ page }) => {
    await signUpAndLogin(page)
    await expect(page.locator('aside').getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.locator('aside').getByRole('link', { name: 'Tarefas' })).toBeVisible()
    await expect(page.locator('aside').getByRole('link', { name: 'Categorias' })).toBeVisible()
    await expect(page.locator('aside').getByRole('link', { name: 'Configurações' })).toBeVisible()
  })

  test('header exibe email do usuário', async ({ page }) => {
    const email = await signUpAndLogin(page)
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('header').getByText(email)).toBeVisible()
  })

  test('bottom nav oculta no desktop', async ({ page }) => {
    await signUpAndLogin(page)
    const bottomNav = page.locator('nav.md\\:hidden')
    await expect(bottomNav).toBeHidden()
  })
})

test.describe('Layout — Mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('sidebar oculta no mobile', async ({ page }) => {
    await signUpAndLogin(page)
    await expect(page.locator('aside')).toBeHidden()
  })

  test('bottom nav visível no mobile', async ({ page }) => {
    await signUpAndLogin(page)
    await expect(page.locator('nav').filter({ hasText: 'Dashboard' })).toBeVisible()
  })
})

test.describe('Layout — Navegação', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('link Dashboard ativo em /dashboard', async ({ page }) => {
    await signUpAndLogin(page)
    const dashLink = page.locator('aside').getByRole('link', { name: 'Dashboard' })
    await expect(dashLink).toHaveClass(/text-blue-700/)
  })
})

test.describe('Página 404', () => {
  // Usuário não-autenticado em rota desconhecida → proxy redireciona para /login (segurança correta)
  test('rota inexistente redireciona para /login quando não autenticado', async ({ page }) => {
    await page.goto('/rota-que-nao-existe')
    await expect(page).toHaveURL(/\/login/)
  })
})
