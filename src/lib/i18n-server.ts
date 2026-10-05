// Server-side locale read (cookie) for Server Components. No business logic
// touched — read-only localization.
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from '@/lib/i18n';
import { en, es, type Dictionary } from '@/lib/i18n-dict';

export function getLocale(): Locale {
  try {
    const v = cookies().get(LOCALE_COOKIE)?.value;
    if (isLocale(v)) return v;
  } catch {
    // cookies() unavailable (static prerender) — fall back to default.
  }
  return DEFAULT_LOCALE;
}

export function getDict(locale?: Locale): Dictionary {
  const l = locale ?? getLocale();
  return l === 'es' ? es : en;
}
