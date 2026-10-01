// TEMPORARY nine-asset + activity QA (deleted after the pass). Asserts
// counts, lengths, shapes, and wiring — address values never leave the browser.
import { expect, test } from '@playwright/test';
import * as fs from 'fs';

const { u1 } = JSON.parse(
  fs.readFileSync('C:\\Users\\Admin\\AppData\\Local\\Temp\\opencode\\axiora-login-users.json', 'utf8')
) as { u1: { email: string; password: string } };

test('nine configured methods, per-network wiring, QR/copy/logos', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/login');
  await page.waitForSelector('#login-identifier');
  await page.waitForTimeout(2500);
  await page.fill('#login-identifier', u1.email);
  await page.fill('#login-password', u1.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/app/dashboard', { timeout: 60000 });
  await page.goto('/app/deposit');
  const methods = page.getByRole('button', { name: /logo/ });
  await expect(methods).toHaveCount(9, { timeout: 30000 });
  // Each USDT variant resolves through its own variable (shape-checked).
  async function selectAndInspect(re: RegExp) {
    await page.getByRole('button', { name: re }).click();
    await page.waitForTimeout(400);
    return page.evaluate(() => {
      const el = document.querySelector('div.font-mono.text-\\[15px\\]');
      const t = (el?.textContent || '').trim();
      return { len: t.length, t: t[0] === 'T', x: t.startsWith('0x') };
    });
  }
  const trc = await selectAndInspect(/USDT.*TRC-20/);
  const bep = await selectAndInspect(/USDT.*BEP-20/);
  const erc = await selectAndInspect(/USDT.*ERC-20/);
  for (const s of [trc, bep, erc]) expect(s.len).toBeGreaterThan(25);
  expect(trc.t).toBe(true);
  expect(bep.x).toBe(true);
  expect(erc.x).toBe(true);
  // QR + copy follow the selected method; logos render.
  await page.getByRole('button', { name: /show qr code/i }).click();
  await expect(page.getByRole('img', { name: /qr code/i })).toBeVisible();
  await page.getByRole('button', { name: /copy address/i }).click();
  await expect(page.getByRole('button', { name: /copied/i })).toBeVisible();
  expect(await page.evaluate(async () => (await navigator.clipboard.readText()).length)).toBeGreaterThan(25);
  expect(await page.locator('img[alt$="logo"]').count()).toBeGreaterThanOrEqual(9);
  await page.getByRole('button', { name: /get deposit address/i }).click();
  await expect(page.getByText('Transaction hash / TXID')).toBeVisible({ timeout: 15000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test('homepage shows honest empty states (no fabricated activity)', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('section[aria-label="Live protocol telemetry"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await expect(page.getByText('AWAITING LIVE DATA').first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('No confirmed deposits yet.')).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('No completed withdrawals yet.')).toBeVisible({ timeout: 30000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});
