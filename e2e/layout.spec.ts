import { test, expect, type Page } from '@playwright/test'

// Cria um usuário único por suite de layout (evita dependência de usuário fixo)
const layoutUser = {
  email: `test+layout+${Date.now()}@example.com`,
  password: 'senha12345',
}

async function signUpAndLogin(page: Page) {
  await page.goto('/signup')
  await page.getByLabel('Email').fill(layoutUser.email)
  await page.getByLabel('Senha', { exact: true }).fill(layoutUser.password)
  await page.getByLabel('Confirmar senha').fill(layoutUser.password)
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
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
    await signUpAndLogin(page)
    await expect(page.locator('header')).toBeVisible()
    // Verifica que algum texto de identificação do usuário está no header
    await expect(page.locator('header').getByText(layoutUser.email)).toBeVisible()
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
  test('rota inexistente exibe página 404', async ({ page }) => {
    await page.goto('/rota-que-nao-existe')
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText('Página não encontrada')).toBeVisible()
  })
})
