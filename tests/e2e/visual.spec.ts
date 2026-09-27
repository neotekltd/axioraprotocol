import { test, expect } from '@playwright/test';

test('homepage visual capture', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByText('AXIORA PROTOCOL').first()).toBeVisible();
  // Walk the page so scroll-reveal sections enter the viewport like a real visit
  const sections = await page.locator('main section').count();
  for (let i = 0; i < sections; i++) {
    await page.locator('main section').nth(i).scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: `tests/e2e/__screenshots__/home-${test.info().project.name}.png`, fullPage: true });
  await page.screenshot({ path: `tests/e2e/__screenshots__/hero-${test.info().project.name}.png` });
});
