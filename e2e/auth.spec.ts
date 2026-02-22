import { test, expect } from '@playwright/test'

// Email único por run para evitar conflito de usuários existentes
const testEmail = () => `test+${Date.now()}@example.com`
const testPassword = 'senha12345'

test.describe('Auth — Proteção de rotas', () => {
  test('acessa /dashboard sem sessão → redireciona para /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('página de login exibe formulário', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('página de signup exibe formulário', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirmar senha')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible()
  })
})

test.describe('Auth — Validações de formulário', () => {
  test('login com email inválido exibe erro de validação', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('nao-e-email')
    await page.getByLabel('Senha').fill('qualquer')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('Email inválido')).toBeVisible()
  })

  test('login com credenciais inválidas exibe mensagem de erro', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('nao@existe.com')
    await page.getByLabel('Senha').fill('senha_errada')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('Email ou senha incorretos')).toBeVisible({ timeout: 10000 })
  })

  test('signup com senhas diferentes exibe erro', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('Email').fill(testEmail())
    await page.getByLabel('Senha', { exact: true }).fill('senha12345')
    await page.getByLabel('Confirmar senha').fill('senhadiferente')
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await expect(page.getByText('As senhas não coincidem')).toBeVisible()
  })

  test('signup com senha curta exibe erro', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('Email').fill(testEmail())
    await page.getByLabel('Senha', { exact: true }).fill('curta')
    await page.getByLabel('Confirmar senha').fill('curta')
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await expect(page.getByText('Senha deve ter no mínimo 8 caracteres')).toBeVisible()
  })
})

test.describe('Auth — Fluxos completos', () => {
  test('signup com novo usuário → redireciona para /dashboard', async ({ page }) => {
    const email = testEmail()
    await page.goto('/signup')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Senha', { exact: true }).fill(testPassword)
    await page.getByLabel('Confirmar senha').fill(testPassword)
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('login com /login depois de autenticado → redireciona para /dashboard', async ({ page }) => {
    // Primeiro faz signup para ter um usuário
    const email = testEmail()
    await page.goto('/signup')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Senha', { exact: true }).fill(testPassword)
    await page.getByLabel('Confirmar senha').fill(testPassword)
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    // Tenta acessar /login com sessão ativa → deve redirecionar
    await page.goto('/login')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('logout encerra sessão e redireciona para /login', async ({ page }) => {
    // Signup para ter sessão
    const email = testEmail()
    await page.goto('/signup')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Senha', { exact: true }).fill(testPassword)
    await page.getByLabel('Confirmar senha').fill(testPassword)
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    // Logout
    await page.getByRole('button', { name: 'Sair' }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

    // Confirma que não consegue mais acessar /dashboard
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
