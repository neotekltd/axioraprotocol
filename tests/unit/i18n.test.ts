import { describe, expect, it } from 'vitest';
import { dirOf, isLocale, LOCALES, localeLabel } from '@/lib/i18n';
import { en, es, type Dictionary } from '@/lib/i18n-dict';

// Every English key must exist in Spanish with the same shape. Structural
// parity — translation quality is reviewed separately.
function keysOf(v: unknown, path = '$'): string[] {
  if (Array.isArray(v)) {
    const out: string[] = [];
    v.forEach((item, i) => out.push(...keysOf(item, `${path}[${i}]`)));
    return out;
  }
  if (v !== null && typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>).flatMap(([k, item]) =>
      keysOf(item, `${path}.${k}`)
    );
  }
  return [path];
}

function getAt(root: unknown, path: string): unknown {
  const parts = path
    .slice(2)
    .split(/\.|\[|\]/)
    .filter((p) => p !== '');
  let cur = root;
  for (const p of parts) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

describe('i18n locales', () => {
  it('supports exactly en + es, both LTR', () => {
    expect([...LOCALES]).toEqual(['en', 'es']);
    expect(dirOf('en')).toBe('ltr');
    expect(dirOf('es')).toBe('ltr');
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(true);
    expect(isLocale('ar')).toBe(false);
    expect(localeLabel('es')).toBe('Español');
  });

  it('spanish dictionary covers every english key with matching types', () => {
    const dict: Dictionary = es;
    for (const path of keysOf(en)) {
      const a = getAt(en, path);
      const b = getAt(dict, path);
      expect(typeof b, `missing or mistyped: ${path}`).toBe(typeof a);
      if (typeof a === 'string') {
        // Placeholders must survive translation.
        for (const m of a.match(/\{[a-z]+\}/g) ?? []) {
          expect(String(b), `${path} lost placeholder ${m}`).toContain(m);
        }
      }
    }
  });

  it('spanish faqs mirror the english list length', () => {
    expect(es.faqs.length).toBe(en.faqs.length);
    expect(es.bootSteps.length).toBe(en.bootSteps.length);
  });
});
