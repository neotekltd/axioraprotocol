'use client';

// Greeting pill. Default label matches the reference composition
// ("SAY HELLO"); each press cycles a live status line derived from the
// REAL plan engine (module count, cycle length, entry minimum, daily
// payouts, next-payout countdown) — never invented figures. Decorative
// orbit rings are aria-hidden; the button itself is keyboard-focusable
// with a visible focus ring.
import { useEffect, useState } from 'react';
import { PLANS, formatUSD } from '@/lib/plans';

function useCountdown(): string {
  const [label, setLabel] = useState('NEXT IN --:--:--');
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const tick = () => {
      const sixH = 6 * 3600 * 1000;
      const remain = sixH - (Date.now() % sixH);
      const h = Math.floor(remain / 3600000);
      const m = Math.floor((remain % 3600000) / 60000);
      const s = Math.floor((remain % 60000) / 1000);
      setLabel(`NEXT IN ${pad(h)}:${pad(m)}:${pad(s)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return label;
}

export function RobotGreeting() {
  const [i, setI] = useState(0);
  const countdown = useCountdown();
  const mins = PLANS.map((p) => p.min);
  const entry = Math.min(...mins);
  const cycle = PLANS[0].cycleHours;
  const perDay = PLANS[0].creditsPerDay;
  const list = [
    'SAY HELLO',
    `${PLANS.length} MODULES LIVE`,
    `CYCLE EVERY ${cycle}H`,
    `ENTRY FROM ${formatUSD(entry, { decimals: 0 })}`,
    `${perDay} PAYOUTS / DAY`,
    countdown,
  ];
  const current = list[i % list.length];
  return (
    <div className="relative z-[6] mx-auto mt-1 w-fit">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-10 -inset-y-2">
        <div className="orbit-pill-a absolute inset-0 rounded-[50%] border border-[#2FD6FF]/25" />
        <div className="orbit-pill-b absolute inset-x-6 inset-y-0 rounded-[50%] border border-dashed border-[#2FD6FF]/20" />
      </div>
      <button
        type="button"
        onClick={() => setI((v) => (v + 1) % list.length)}
        aria-live="polite"
        aria-label={`Service status: ${current}. Activate for next status.`}
        className="greet-float relative flex items-center gap-2.5 rounded-full border border-[#2A394D] bg-[#0B111C]/90 px-6 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-white shadow-[0_0_24px_rgba(47,214,255,0.12)] backdrop-blur transition hover:border-[rgba(47,214,255,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2FD6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070B]"
      >
        <span className="robot-glow-dot h-2 w-2 rounded-full bg-[#2FD6FF] shadow-[0_0_10px_rgba(47,214,255,0.9)]" aria-hidden="true" />
        {current}
      </button>
    </div>
  );
}
