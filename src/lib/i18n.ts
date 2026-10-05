// Axiora locale system — English + neutral international Spanish.
// Both locales are LTR: no RTL code exists in this project.

export type Locale = 'en' | 'es';

export const LOCALES: readonly Locale[] = ['en', 'es'];

export const LOCALE_COOKIE = 'axiora-lang';
export const LOCALE_STORAGE = 'axiora-lang';
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(v: unknown): v is Locale {
  return v === 'en' || v === 'es';
}

export function dirOf(_locale: Locale): 'ltr' {
  return 'ltr';
}

export function localeLabel(locale: Locale): string {
  return locale === 'es' ? 'Español' : 'English';
}

// Latin digits everywhere (financial/technical values stay unambiguous in
// both locales); grouping follows the Latin convention.
export function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}
