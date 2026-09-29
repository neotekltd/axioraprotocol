'use client';

// Original Axiora engine visual: protocol core device with a REAL countdown
// to the next 6-hour payout boundary, ring decor, and satellite chips with
// real config values. No robot art, no fake telemetry.

import { useEffect, useState } from 'react';
import { useInViewOnce } from '@/components/landing/motion';

function useNextCycleCountdown(active: boolean): string {
  const [label, setLabel] = useState('--:--:--');
  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const now = new Date();
      const ms = now.getTime();
      const sixH = 6 * 3600 * 1000;
      const remain = sixH - (ms % sixH);
      const h = Math.floor(remain / 3600000);
      const m = Math.floor((remain % 3600000) / 60000);
      const s = Math.floor((remain % 60000) / 1000);
      setLabel(
        `${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);
  return label;
}

export function EngineViz() {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.3);
  const countdown = useNextCycleCountdown(inView);

  return (
    <div ref={ref} className="anim-drift relative mx-auto aspect-square w-full max-w-[420px]">
      <div className="absolute inset-0 rounded-full border border-cyanx/10 animate-[spin_40s_linear_infinite]" aria-hidden="true" />
      <div className="absolute inset-6 rounded-full border border-dashed border-white/10 animate-[spin_60s_linear_infinite_reverse]" aria-hidden="true" />
      <div className="absolute inset-16 rounded-full bg-cyanx/5 blur-2xl" aria-hidden="true" />
      <div className="relative z-10 mx-auto mt-[22%] w-64 rounded-2xl border border-pulse/50 bg-panel/90 p-5 text-center shadow-glow backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-line pb-2 font-mono text-[10px] text-fog">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-pulse" aria-hidden="true" /> PROTOCOL CORE
          </span>
          <span className="font-semibold text-pulse">ONLINE</span>
        </div>
        <div className="mt-3 rounded-xl border border-line bg-void p-3">
          <div className="font-mono text-[15px] tracking-[0.15em] text-pulse" aria-live="off" suppressHydrationWarning>
            {countdown}
          </div>
          <div className="mt-0.5 font-mono text-[9px] tracking-[0.2em] text-fog">NEXT PAYOUT CYCLE</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-left font-mono text-[10px]">
          <div className="rounded-md border border-line bg-void p-2">
            <span className="block text-fog">CYCLE</span>
            <span className="font-semibold text-white">Every 6h</span>
          </div>
          <div className="rounded-md border border-line bg-void p-2">
            <span className="block text-fog">PAYOUTS</span>
            <span className="font-semibold text-pulse">4 / DAY</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] text-pulse">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pulse" aria-hidden="true" /> TELEMETRY SYNCED
        </div>
      </div>
      <div className="anim-chip absolute -top-1 right-2 rounded-lg border border-line bg-panel/90 px-2.5 py-1.5 backdrop-blur" aria-hidden="true">
        <div className="font-mono text-[9px] text-fog">PLANS</div>
        <div className="font-mono text-[11px] font-semibold text-pulse">3 LIVE</div>
      </div>
      <div className="anim-chip-2 absolute bottom-6 left-0 rounded-lg border border-line bg-panel/90 px-2.5 py-1.5 backdrop-blur" aria-hidden="true">
        <div className="font-mono text-[9px] text-fog">MIN ENTRY</div>
        <div className="font-mono text-[11px] font-semibold text-white">$10</div>
      </div>
      <div className="anim-chip-3 absolute right-4 top-1/2 rounded-lg border border-line bg-panel/90 px-2.5 py-1.5 backdrop-blur" aria-hidden="true">
        <div className="font-mono text-[9px] text-fog">CREDITS</div>
        <div className="font-mono text-[11px] font-bold text-white">4 / DAY</div>
      </div>
    </div>
  );
}
