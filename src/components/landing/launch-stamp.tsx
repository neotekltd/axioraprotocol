'use client';

// Public homepage launch stamp: fixed go-live moment plus the live
// site-wide elapsed counter. Static UTC date renders identically on
// server and client (no hydration mismatch); only the elapsed digits
// tick, once per second.
import { formatLaunchUtc, launchTimestampMs } from '@/lib/launch';
import { useLiveCounter } from '@/components/LiveCounter';
import { useT } from '@/components/LanguageProvider';

export function LaunchStamp() {
  const t = useT();
  const elapsed = useLiveCounter();
  const stamp = formatLaunchUtc(launchTimestampMs());
  return (
    <p
      role="status"
      aria-label={t.land.liveSinceAria.replace('{s}', stamp).replace('{e}', elapsed)}
      className="hero-in mt-6 flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.18em] text-fog"
      style={{ animationDelay: '950ms' }}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#35D98B]" aria-hidden="true" />
      <span className="font-semibold text-pulse">{t.land.liveWord}</span>
      <span aria-hidden="true" className="text-fog/50">·</span>
      <span dir="ltr" suppressHydrationWarning>{elapsed}</span>
      <span aria-hidden="true" className="text-fog/50">·</span>
      <span>{t.land.since.replace('{s}', stamp)}</span>
    </p>
  );
}
