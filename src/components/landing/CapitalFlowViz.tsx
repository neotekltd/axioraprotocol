'use client';

// Original Axiora capital-flow visual: DEPOSIT → PLAN → SETTLEMENT → WALLET.
// Staged reveal on first view with a traveling signal along the spine.
// No model/AI nodes: Axiora is the capital and settlement layer.

import { useEffect, useState } from 'react';
import { useInViewOnce } from '@/components/landing/motion';

const STAGES = [
  { key: 'DEPOSIT', x: 60 },
  { key: 'PLAN', x: 173 },
  { key: 'SETTLEMENT', x: 287 },
  { key: 'WALLET', x: 400 },
];

export function CapitalFlowViz() {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.3);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage(4);
      return;
    }
    setStage(1);
    const timers = [2, 3, 4].map((s, i) => setTimeout(() => setStage(s), 650 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="anim-drift relative">
      <svg viewBox="0 0 460 300" className="w-full" role="img" aria-label="Axiora capital flow: deposit, plan, settlement, wallet">
        <defs>
          <radialGradient id="axf-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
        </defs>
        <line x1="30" y1="150" x2="430" y2="150" stroke="#22D3EE" strokeOpacity="0.25" strokeWidth="1" />
        {stage >= 1 && <span className="signal-x" style={{ animationDuration: '3s' }} />}
        {STAGES.map((s, i) => {
          const on = stage > i;
          return (
            <g key={s.key} opacity={on ? 1 : 0.35} style={{ transition: 'opacity 0.6s ease', transitionDelay: `${i * 0.12}s` }}>
              <circle cx={s.x} cy="150" r="52" fill="url(#axf-core)" opacity={on ? 1 : 0} style={{ transition: 'opacity 0.8s ease' }} />
              <circle cx={s.x} cy="150" r="26" fill="rgba(34,211,238,0.07)" stroke={on ? '#22D3EE' : 'rgba(148,163,184,0.4)'} strokeWidth="1.5" className={on ? 'ping-soft' : undefined} />
              <circle cx={s.x} cy="150" r="5" fill={on ? '#22D3EE' : '#475569'} className={on ? 'pulse-node' : undefined} />
              <text x={s.x} y="200" textAnchor="middle" fill={on ? '#fff' : '#64748B'} fontSize="10" fontWeight="bold" fontFamily="monospace" letterSpacing="2">{s.key}</text>
              <text x={s.x} y="216" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace" letterSpacing="1.5">
                {['FUNDS IN', 'TERMS SET', 'PAYOUTS OUT', 'FUNDS OUT'][i]}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center font-mono text-[0.6875rem] tracking-[0.2em] text-fog">DEPOSIT → PLAN → SETTLEMENT → WALLET</p>
    </div>
  );
}
