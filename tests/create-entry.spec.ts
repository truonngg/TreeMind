import { test, expect } from '@playwright/test'

test.describe('Create Entry Flow', () => {
  test('should create a new entry and display it in library', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create')
    
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('New Entry')
    
    // Fill in the entry form
    const title = 'Test Entry - ' + Date.now()
    const content = 'This is a test entry created by Playwright. It contains some content to test the create entry flow.'
    
    // Fill title
    await page.fill('input[placeholder="Give your entry a title..."]', title)
    
    // Fill content
    await page.fill('textarea[placeholder="Start writing here..."]', content)
    
    // Click save button
    await page.click('button:has-text("Save Entry")')
    
    // Wait for navigation to library page
    await expect(page).toHaveURL('/library')
    
    // Verify the entry appears in the library
    await expect(page.locator('h1')).toContainText('Your Library')
    
    // Check that our entry is displayed
    await expect(page.locator(`text=${title}`)).toBeVisible()
    await expect(page.locator(`text=${content.substring(0, 50)}`)).toBeVisible()
    
    // Verify sentiment analysis is working (should show a sentiment badge)
    await expect(page.locator('[class*="bg-emerald-100"], [class*="bg-blue-100"], [class*="bg-rose-100"]')).toBeVisible()
  })

  test('should handle empty entry gracefully', async ({ page }) => {
    await page.goto('/create')
    
    // Try to save without any content
    const saveButton = page.locator('button:has-text("Save Entry")')
    await expect(saveButton).toBeDisabled()
    
    // Add some content
    await page.fill('textarea[placeholder="Start writing here..."]', 'Some content')
    
    // Now save button should be enabled
    await expect(saveButton).toBeEnabled()
  })

  test('should generate AI title suggestion', async ({ page }) => {
    await page.goto('/create')
    
    // Add some content first
    await page.fill('textarea[placeholder="Start writing here..."]', 'This is a test entry about my day at work')
    
    // Click the AI title suggestion button
    await page.click('button[title="Suggest a title"]')
    
    // Wait for suggestion to appear
    await expect(page.locator('text=Suggested title:')).toBeVisible()
    
    // Verify suggestion is shown
    const suggestionText = page.locator('text=Suggested title:').locator('..').locator('p').last()
    await expect(suggestionText).toBeVisible()
    
    // Accept the suggestion
    await page.click('button:has-text("Use This")')
    
    // Verify the title was filled
    const titleInput = page.locator('input[placeholder="Give your entry a title..."]')
    await expect(titleInput).toHaveValue(/.+/)
  })

  test('should use prompt cards to start writing', async ({ page }) => {
    await page.goto('/create')
    
    // Click on a prompt card
    await page.click('text=How was your day?')
    
    // Verify the prompt was added to the textarea
    const textarea = page.locator('textarea[placeholder="Start writing here..."]')
    await expect(textarea).toHaveValue(/How was your day?/)
  })

  test('should navigate back to home from create page', async ({ page }) => {
    await page.goto('/create')
    
    // Click back button
    await page.click('a:has-text("Back")')
    
    // Should navigate to home page
    await expect(page).toHaveURL('/')
  })

  test('should show voice recording simulation', async ({ page }) => {
    await page.goto('/create')
    
    // Click voice rant button
    await page.click('button:has-text("Voice Rant")')
    
    // Should show recording state
    await expect(page.locator('button:has-text("Recording...")')).toBeVisible()
    
    // Wait for recording to complete (2 seconds)
    await page.waitForTimeout(2500)
    
    // Should show completed state and add content
    await expect(page.locator('button:has-text("Voice Rant")')).toBeVisible()
    
    // Check that voice content was added
    const textarea = page.locator('textarea[placeholder="Start writing here..."]')
    await expect(textarea).toHaveValue(/Voice recording transcription/)
  })
})

test.describe('Library Page', () => {
  test('should display empty state when no entries exist', async ({ page }) => {
    // Clear any existing entries by going to create page first
    await page.goto('/create')
    
    // Go to library
    await page.goto('/library')
    
    // Should show empty state
    await expect(page.locator('text=No entries yet')).toBeVisible()
    await expect(page.locator('text=Start with a sentence')).toBeVisible()
    
    // Should have create entry button
    await expect(page.locator('a:has-text("Create your first entry")')).toBeVisible()
  })

  test('should filter entries by sentiment', async ({ page }) => {
    // First create an entry
    await page.goto('/create')
    await page.fill('input[placeholder="Give your entry a title..."]', 'Happy Entry')
    await page.fill('textarea[placeholder="Start writing here..."]', 'I am feeling happy today!')
    await page.click('button:has-text("Save Entry")')
    
    // Go to library
    await page.goto('/library')
    
    // Should see the entry
    await expect(page.locator('text=Happy Entry')).toBeVisible()
    
    // Filter by positive sentiment
    await page.click('button:has-text("All Sentiments")')
    await page.click('text=Positive')
    
    // Should still see the entry
    await expect(page.locator('text=Happy Entry')).toBeVisible()
    
    // Filter by negative sentiment
    await page.click('button:has-text("Positive")')
    await page.click('text=Negative')
    
    // Should not see the entry
    await expect(page.locator('text=Happy Entry')).not.toBeVisible()
  })

  test('should search entries', async ({ page }) => {
    // Create an entry with specific content
    await page.goto('/create')
    await page.fill('input[placeholder="Give your entry a title..."]', 'Search Test Entry')
    await page.fill('textarea[placeholder="Start writing here..."]', 'This entry contains the word unicorn')
    await page.click('button:has-text("Save Entry")')
    
    // Go to library
    await page.goto('/library')
    
    // Search for the entry
    await page.fill('input[placeholder="Search entries…"]', 'unicorn')
    
    // Should see the entry
    await expect(page.locator('text=Search Test Entry')).toBeVisible()
    
    // Search for something not in the entry
    await page.fill('input[placeholder="Search entries…"]', 'dragon')
    
    // Should not see the entry
    await expect(page.locator('text=Search Test Entry')).not.toBeVisible()
  })
})
