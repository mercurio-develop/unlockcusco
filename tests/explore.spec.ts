import { test, expect } from '@playwright/test';

test.describe('Inkaportal Core Flows', () => {
  
  test('Landing page search redirects and auto-opens AI Concierge', async ({ page }) => {
    // Navigate to landing page
    await page.goto('http://localhost:3000/');
    
    // Check if the landing page loaded
    await expect(page.getByText('Beyond the Map.')).toBeVisible();

    // Type a prompt and submit
    const searchInput = page.getByPlaceholder(/I need a taxi from Pisac/i);
    await searchInput.fill("I'm in Pisac and need to get to Ollantaytambo");
    await searchInput.press('Enter');

    // Wait for navigation to /explore
    await page.waitForURL(/\/explore\?ai_prompt=/);
    
    // The AI Concierge should automatically open
    await expect(page.getByText('Vallecito Concierge')).toBeVisible({ timeout: 10000 });
    
    // The input should be sent and present in the chat
    await expect(page.getByText("I'm in Pisac and need to get to Ollantaytambo").first()).toBeVisible({ timeout: 10000 });
  });

  test('Explore page renders business cards and filters', async ({ page }) => {
    await page.goto('http://localhost:3000/explore');
    
    // Check header
    await expect(page.getByText('Explore the VALLECITO')).toBeVisible();

    // Check if the quick filters are present
    const diningFilter = page.getByRole('button', { name: /Dining/i });
    await expect(diningFilter).toBeVisible();
    
    // Click Dining filter
    await diningFilter.click();
    
    // URL should update to include category filter
    await expect(page).toHaveURL(/cat=Dining/);
  });

});
