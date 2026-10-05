'use client';

// Single locale state for the whole document. Persists to localStorage +
// cookie (cookie feeds Server Components), flips <html lang> (dir stays
// ltr for both locales), preserves route/session/state — no redirect, then
// refreshes server-rendered strings.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_STORAGE, dirOf, isLocale, type Locale,
} from '@/lib/i18n';
import { en, es, type Dictionary } from '@/lib/i18n-dict';

type Ctx = { locale: Locale; dir: 'ltr'; t: Dictionary; setLocale: (l: Locale) => void };

const LanguageContext = createContext<Ctx>({ locale: DEFAULT_LOCALE, dir: 'ltr', t: en, setLocale: () => {} });

function readInitial(fallback: Locale): Locale {
  try {
    const s = window.localStorage.getItem(LOCALE_STORAGE);
    if (isLocale(s)) return s;
    const m = document.cookie.match(/(?:^|;\s*)axiora-lang=(en|es)/);
    if (m && isLocale(m[1])) return m[1];
  } catch {
    // storage unavailable — use server-provided fallback.
  }
  return fallback;
}

export function LanguageProvider({ initial, children }: { initial: Locale; children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initial);

  // Client may know better (localStorage survives login/logout); sync once.
  useEffect(() => {
    const l = readInitial(initial);
    if (l !== initial) setLocaleState(l);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dirOf(locale);
    try {
      window.localStorage.setItem(LOCALE_STORAGE, locale);
      document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {
      // persistence best-effort only.
    }
  }, [locale ]);

  const setLocale = useCallback(
    (l: Locale) => {
      if (!isLocale(l) || l === locale) return;
      setLocaleState(l);
      // Re-render Server Components with the new dictionary; route, session
      // and client state are preserved (no navigation).
      setTimeout(() => router.refresh(), 0);
    },
    [locale, router]
  );

  const value = useMemo<Ctx>(
    () => ({ locale, dir: dirOf(locale), t: locale === 'es' ? es : en, setLocale }),
    [locale, setLocale]
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Ctx {
  return useContext(LanguageContext);
}

// Shorthand for translated strings.
export function useT(): Dictionary {
  return useContext(LanguageContext).t;
}
