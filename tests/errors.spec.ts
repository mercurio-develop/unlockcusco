import { test, expect } from '@playwright/test';

test('Check for browser console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('http://127.0.0.1:9005/');
  await page.waitForTimeout(3000);
  
  if (errors.length > 0) {
    console.error('BROWSER ERRORS FOUND:', errors);
  }
  
  await page.goto('http://127.0.0.1:9005/explore');
  await page.waitForTimeout(3000);
  
  if (errors.length > 0) {
    console.error('BROWSER ERRORS FOUND:', errors);
  }
  
  expect(errors.length).toBe(0);
});
