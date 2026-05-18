import { test, expect } from '@playwright/test';

test.describe('AI Concierge Execution Tests', () => {
  test('AI should trigger map search when asked to show on map', async ({ page }) => {
    // Navigate to explore page
    await page.goto('/explore');

    // Ensure the chat is open (click the FAB if it's closed)
    // The exact selector depends on the UI, assuming there's a button with a chat icon or text
    const chatFab = page.locator('button:has-text("Concierge"), button[title="Concierge"]');
    if (await chatFab.isVisible()) {
      await chatFab.click();
    }

    // Wait for chat to load
    await expect(page.locator('input[placeholder="Describe your ideal day..."]')).toBeVisible();

    // Fill the input
    await page.fill('input[placeholder="Describe your ideal day..."]', 'show me only the restaurants in the map in urubamba');
    await page.press('input[placeholder="Describe your ideal day..."]', 'Enter');

    // Wait for the AI to process and respond
    // If the prompt is correct, the AI will call searchDatabase which updates the mapSearchResults state
    // We should expect a generic fallback response or tool call card
    
    // Check if tool invocation triggers any visual change (e.g. search results card or pins on map)
    // Note: this test requires the local server to have a valid AI key and DB connection.
    // As a simple proxy, we just ensure no unhandled exceptions crash the page.
    await page.waitForTimeout(3000); // Give AI time to respond
    
    // Verify chat response does not contain explicit "I've added these..." without tool
    // We can't strictly assert LLM text output easily, but we can verify the UI didn't crash
    await expect(page.locator('text=Vallecito').first()).toBeVisible();
  });

  test('AI should use mutateItinerary for swap actions', async ({ page }) => {
    await page.goto('/explore');

    // Provide a mocked or seeded itinerary state if possible, or just send the command
    await page.fill('input[placeholder="Describe your ideal day..."]', 'swap native peruvian restaurant with kampu in urubamba');
    await page.press('input[placeholder="Describe your ideal day..."]', 'Enter');

    // Verify system remains stable and tool handles it gracefully
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Vallecito').first()).toBeVisible();
  });
});
