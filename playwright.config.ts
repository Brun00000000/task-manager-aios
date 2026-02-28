import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  // Supabase free tier pode ser lento em CI (20-30s por chamada de signUp)
  // 90s garante: ~3s form + ~30s signUp + ~2s navegação + margem
  timeout: 90000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Em CI, o build já foi feito pelo step anterior — apenas inicia o servidor
    // Em local, builda e inicia (ou reutiliza servidor existente)
    command: process.env.CI ? 'npm start' : 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
