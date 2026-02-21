import { test, expect } from '@playwright/test'

test('homepage shows Coming Soon', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Task Manager' })).toBeVisible()
  await expect(page.getByText('Coming Soon')).toBeVisible()
})
