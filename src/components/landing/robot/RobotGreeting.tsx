'use client';

// Orbital interaction pill. Functional: each press cycles a live status
// line derived from the REAL plan engine (module count, cycle length,
// entry minimum, daily payouts) — never invented figures.
import { useState } from 'react';
import { PLANS, formatUSD } from '@/lib/plans';

function facts(): string[] {
  const mins = PLANS.map((p) => p.min);
  const entry = Math.min(...mins);
  const cycle = PLANS[0].cycleHours;
  const perDay = PLANS[0].creditsPerDay;
  return [
    `${PLANS.length} modules live`,
    `cycle every ${cycle} hours`,
    `entry from ${formatUSD(entry, { decimals: 0 })}`,
    `${perDay} payouts / day`,
  ];
}

export function RobotGreeting() {
  const [i, setI] = useState(0);
  const list = facts();
  const current = list[i % list.length];
  return (
    <div className="relative z-[6] mx-auto mt-1 w-fit">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-10 -inset-y-2">
        <div className="orbit-pill-a absolute inset-0 rounded-[50%] border border-[#2FD6FF]/25" />
        <div className="orbit-pill-b absolute inset-x-6 inset-y-0 rounded-[50%] border border-dashed border-[#2FD6FF]/20" />
      </div>
      <button
        type="button"
        onClick={() => setI((v) => v + 1)}
        aria-live="polite"
        aria-label={`Service status: ${current}. Activate for next status.`}
        className="greet-float relative flex items-center gap-2.5 rounded-full border border-[#2A394D] bg-[#0B111C]/90 px-6 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-white shadow-[0_0_24px_rgba(47,214,255,0.12)] backdrop-blur transition hover:border-[rgba(47,214,255,0.55)]"
      >
        <span className="robot-glow-dot h-2 w-2 rounded-full bg-[#2FD6FF] shadow-[0_0_10px_rgba(47,214,255,0.9)]" aria-hidden="true" />
        {current}
      </button>
    </div>
  );
}
