import { test, expect } from '@playwright/test';

test('display font resolves to Space Grotesk', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return {
      h1Family: h1 ? getComputedStyle(h1).fontFamily : 'none',
      groteskLoaded: document.fonts.check('700 64px "Space Grotesk"'),
      geistLoaded: document.fonts.check('400 16px "Geist Sans"'),
      faces: Array.from(document.fonts).map((f) => `${f.family}/${f.weight}/${f.status}`).slice(0, 14),
    };
  });
  console.log(`FONTCHECK ${JSON.stringify(r)}`);
  expect(r.groteskLoaded).toBe(true);
});
