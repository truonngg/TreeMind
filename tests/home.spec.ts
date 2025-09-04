import { test, expect } from '@playwright/test'

test('home page loads correctly', async ({ page }) => {
  await page.goto('/home')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
