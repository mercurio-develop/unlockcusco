import { test, expect } from '@playwright/test';

test.describe('AI Concierge E2E', () => {
  test.setTimeout(60000); // Allow 60s for LLM to stream

  test('should find nearby places and display them on the screen', async ({ page }) => {
    // Listen to console logs
    page.on('console', msg => console.log(`[Browser] ${msg.type()}: ${msg.text()}`));

    // Navigate to the Explore page with the ai_prompt flag to force the chat window open
    await page.goto('/explore?ai_prompt=Hello');

    // Find the chat input using the known placeholder
    const chatInput = page.getByPlaceholder(/Describe your ideal day/i).first();
    await expect(chatInput).toBeVisible({ timeout: 15000 });

    // Type the prompt to trigger the searchDatabase tool
    const prompt = "Can you recommend a good coffee shop in Urubamba? Please search the database and show me options.";
    await chatInput.fill(prompt);
    
    // Click the submit button
    const sendButton = page.locator('button[type="submit"]').first();
    await sendButton.click();

    // Wait for the tool result component. SearchResultsCard contains "Top Recommendations" or "Nearby Alternatives"
    await expect(page.locator('text=Recommendations').first().or(page.locator('text=Alternatives').first())).toBeVisible({ timeout: 30000 });
  });
});
