import { test, expect } from '@playwright/test';

test('modules render with approved rates, no crash', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
  await expect(page.getByText('Essential').first()).toBeVisible();
  await expect(page.getByText('1.00%').first()).toBeVisible();
  await expect(page.getByText('1.50%').first()).toBeVisible();
  await expect(page.getByText('2.00%').first()).toBeVisible();
  // Exclusive preview: $2,001 x 2% = $40.02/6h -> daily $160.08
  await expect(page.getByText('$160.08').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('simulator plan switching clamps and recalculates', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.locator('#simulator').scrollIntoViewIfNeeded();
  // default premium 681 -> invalid for premium? 681 in 601-2000 valid
  await expect(page.getByText('$681.00').first()).toBeVisible({ timeout: 15000 });
  // switch to Exclusive -> amount clamps to 2001, credit $40.02
  await page.getByRole('radio', { name: /Exclusive/ }).click();
  await expect(page.getByText('$40.02').first()).toBeVisible({ timeout: 15000 });
  // switch to Essential -> clamps to 600, credit $6.00
  await page.getByRole('radio', { name: /Essential/ }).click();
  await expect(page.getByText('$6.00').first()).toBeVisible({ timeout: 15000 });
});

test('calculator page works per plan', async ({ page }) => {
  await page.goto('/calculator', { waitUntil: 'networkidle', timeout: 60000 });
  await expect(page.getByText('Model your returns')).toBeVisible();
  await page.getByRole('radio', { name: 'Essential' }).click();
  await page.getByLabel('Capital amount').fill('100');
  await expect(page.getByText('$1.00').first()).toBeVisible({ timeout: 15000 });
});
