'use client';

// English | Español segmented control. Switches locale in place: no
// redirect, no route change, session preserved.
import { useLanguage } from '@/components/LanguageProvider';
import { LOCALES, localeLabel, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLanguage();
  return (
    <div
      role="group"
      aria-label={t.account.language}
      className={cn(
        'inline-flex items-center rounded-full border border-[#2A394D] bg-[#0D111A]/80 p-1',
        compact ? 'text-[12px]' : 'text-[13px]'
      )}
    >
      {(LOCALES as readonly Locale[]).map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            lang={l}
            className={cn(
              'rounded-full font-semibold transition',
              compact ? 'px-2.5 py-1.5' : 'px-3.5 py-1.5',
              active ? 'bg-[rgba(47,214,255,0.15)] text-[#2FD6FF]' : 'text-[#AAB5C7] hover:text-white'
            )}
          >
            {localeLabel(l)}
          </button>
        );
      })}
    </div>
  );
}
