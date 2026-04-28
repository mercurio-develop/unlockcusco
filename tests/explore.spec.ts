import { test, expect } from '@playwright/test';

test.describe('InkaPortal App End-to-End', () => {

  test('Hero section search routes to explore page', async ({ page }) => {
    await page.goto('http://127.0.0.1:9005/');
    await page.waitForTimeout(2000); // Wait for React hydration
    
    // Fill the search input
    const input = page.locator('input[placeholder*="Describe your perfect day"]');
    await input.fill('massage');
    
    // Submit the form
    await page.locator('button:has-text("Design Trip")').click();
    
    // Verify it navigated correctly
    await expect(page).toHaveURL(/.*\/explore\?q=massage/, { timeout: 10000 });
    
    // Wait for Explore view to load
    await expect(page.locator('h1:has-text("Explore the INKAPORTAL")')).toBeVisible({ timeout: 10000 });
    
    // Verify there are business cards
    await expect(page.locator('.grid > div').first()).toBeVisible({ timeout: 10000 });
  });

  test('Category quick filters work on Explore page', async ({ page }) => {
    await page.goto('http://127.0.0.1:9005/explore');
    await page.waitForTimeout(2000); // Wait for React hydration
    
    // Click a category badge
    const diningBadge = page.getByRole('button', { name: /Dining/i }).first();
    await diningBadge.click();
    
    // Verify URL
    await expect(page).toHaveURL(/.*\/explore\?q=Dining/, { timeout: 10000 });
  });

  test('AI Concierge chat opens and can send messages', async ({ page }) => {
    await page.goto('http://127.0.0.1:9005/explore');
    await page.waitForTimeout(2000); // Wait for React hydration
    
    // Open the concierge
    const openBtn = page.getByTestId('ai-chat-trigger');
    await openBtn.click();
    
    // Wait for chat to open
    const chatHeader = page.locator('h3:has-text("InkaPortal Concierge")');
    await expect(chatHeader).toBeVisible({ timeout: 10000 });
    
    // Type a message
    const chatInput = page.locator('input[placeholder*="Describe your ideal day"]');
    await chatInput.fill('Hello AI, give me an itinerary');
    
    // The send button might just be a standard button type=submit
    await page.locator('button[type="submit"]').last().click();
    
    // The user message should appear in the chat log
    await expect(page.getByText('Hello AI, give me an itinerary').first()).toBeVisible({ timeout: 10000 });
  });

});


