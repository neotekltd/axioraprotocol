import { test, expect } from '@playwright/test';

test('homepage renders Axiora brand and consensus headline', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('AXIORA PROTOCOL').first()).toBeVisible();
  await expect(page.getByText('Capital on').first()).toBeVisible();
});

test('calculator page renders sliders', async ({ page }) => {
  await page.goto('/calculator');
  await expect(page.getByText('Model deployment outcomes')).toBeVisible();
});
