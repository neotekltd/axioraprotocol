'use client';

// Shared site-wide Live counter: elapsed time since the fixed Axiora
// go-live moment (lib/launch). One-second interval, immediate first paint,
// resync on tab visibility, full cleanup. Initial static 00:00:00 avoids
// hydration mismatch; the client computes the true value on mount.
import { useEffect, useState } from 'react';
import { formatElapsed, launchTimestampMs } from '@/lib/launch';

export function useLiveCounter(): string {
  const [label, setLabel] = useState('00:00:00');
  useEffect(() => {
    const launch = launchTimestampMs();
    const update = () => setLabel(formatElapsed(launch, Date.now()));
    update();
    const id = setInterval(update, 1000);
    const onVis = () => {
      if (!document.hidden) update();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  return label;
}

export function LiveCounter() {
  const label = useLiveCounter();
  return (
    <>
      <span className="text-[13px] font-semibold text-[#AAB5C7]">Live</span>
      <span className="font-mono text-[13px] text-[#78859A]" suppressHydrationWarning>
        {label}
      </span>
    </>
  );
}
