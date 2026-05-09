import { test, expect } from '@playwright/test';

test.describe('AI Concierge E2E', () => {
  test.setTimeout(60000); // Allow 60s for LLM to stream

  test('should generate an itinerary and display it on the screen', async ({ page }) => {
    // Listen to console logs
    page.on('console', msg => console.log(`[Browser] ${msg.type()}: ${msg.text()}`));

    // Navigate to the Explore page with the ai_prompt flag to force the chat window open
    await page.goto('/explore?ai_prompt=Hello');

    // Find the chat input using the known placeholder
    const chatInput = page.getByPlaceholder(/Describe your ideal day/i).first();
    await expect(chatInput).toBeVisible({ timeout: 15000 });

    // Type the prompt to trigger the buildItinerary tool
    const prompt = "Can you build me a 1 day itinerary in Cusco starting with some coffee and a walk? My current location is Plaza de Armas, Cusco and my destination tonight is Cusco. Please build the itinerary now.";
    await chatInput.fill(prompt);
    
    // Press Enter to send
    await chatInput.press('Enter');

    // Wait for the tool result component. ItinerarySummaryCard contains "Your Plan"
    await expect(page.locator('text=Your Plan').first()).toBeVisible({ timeout: 30000 });
  });
});
