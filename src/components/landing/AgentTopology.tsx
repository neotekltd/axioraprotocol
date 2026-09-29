'use client';

// Original Axiora agent-topology visual: four agent nodes feed the consensus
// core, which flows through the risk gate to execution. Staged activation on
// first view (agents → consensus → risk → execution) with traveling signals.
// Labels reflect registry state; without live integrations everything reads
// STANDBY — the motion is decorative, the states are real.

import { useEffect, useState } from 'react';
import { useInViewOnce } from '@/components/landing/motion';
import type { AgentState } from '@/lib/agents';

const NODES = [
  { key: 'signal', x: 52, y: 60 },
  { key: 'risk', x: 52, y: 150 },
  { key: 'execution', x: 52, y: 240 },
  { key: 'sentiment', x: 52, y: 330 },
];

export function AgentTopology({ agents }: { agents: AgentState[] }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.3);
  const [stage, setStage] = useState(0);
  const byKey = new Map(agents.map((a) => [a.key, a]));

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage(4);
      return;
    }
    setStage(1);
    const timers = [2, 3, 4].map((s, i) => setTimeout(() => setStage(s), 800 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const live = stage >= 4 && agents.some((a) => a.status === 'active');
  const nodeColor = (on: boolean) => (on ? '#22D3EE' : 'rgba(148,163,184,0.4)');

  return (
    <div ref={ref} className="anim-drift relative">
      <svg viewBox="0 0 460 390" className="w-full" role="img" aria-label="Axiora agent consensus topology">
        <defs>
          <radialGradient id="axt-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
        </defs>
        {NODES.map((n, i) => {
          const on = stage > 0;
          const st = byKey.get(n.key)?.status.toUpperCase() ?? 'STANDBY';
          return (
            <g key={n.key} opacity={on ? 1 : 0.35} style={{ transition: 'opacity 0.6s ease', transitionDelay: `${i * 0.15}s` }}>
              <line x1={n.x + 34} y1={n.y} x2={200} y2={150} stroke="#22D3EE" strokeOpacity={stage >= 2 ? 0.5 : 0.15} strokeWidth="1"
                className={stage >= 2 ? 'flow-line' : undefined} style={{ animationDuration: '2.4s' }} />
              <rect x={n.x - 34} y={n.y - 22} width="68" height="44" rx="8" fill="rgba(34,211,238,0.05)" stroke={nodeColor(on)} strokeWidth="1" />
              <circle cx={n.x} cy={n.y} r="4" fill={nodeColor(on)} className={on ? 'pulse-node' : undefined} />
              <text x={n.x} y={n.y - 28} textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace" letterSpacing="1.5">
                {byKey.get(n.key)?.name.split(' ')[0] ?? n.key.toUpperCase()}
              </text>
              <text x={n.x} y={n.y + 34} textAnchor="middle" fill={on ? '#22D3EE' : '#475569'} fontSize="7.5" fontFamily="monospace" letterSpacing="1.5">
                {st}
              </text>
            </g>
          );
        })}
        <circle cx="255" cy="150" r="72" fill="url(#axt-core)" opacity={stage >= 2 ? 1 : 0.25} style={{ transition: 'opacity 0.8s ease' }} />
        <rect x="205" y="118" width="100" height="64" rx="12" fill="rgba(34,211,238,0.07)" stroke={nodeColor(stage >= 2)} strokeWidth="1.5" />
        <text x="255" y="145" textAnchor="middle" fill={stage >= 2 ? '#fff' : '#64748B'} fontSize="11" fontWeight="bold" fontFamily="monospace" letterSpacing="2">AXIORA</text>
        <text x="255" y="160" textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace" letterSpacing="2">CONSENSUS</text>
        <line x1="255" y1="182" x2="255" y2="252" stroke="#22D3EE" strokeOpacity={stage >= 3 ? 0.55 : 0.12} strokeWidth="1"
          className={stage >= 3 ? 'flow-line' : undefined} style={{ animationDuration: '1.8s' }} />
        <rect x="195" y="252" width="120" height="34" rx="8" fill="rgba(34,211,238,0.04)" stroke={nodeColor(stage >= 3)} strokeWidth="1" />
        <text x="255" y="273" textAnchor="middle" fill={stage >= 3 ? '#22D3EE' : '#475569'} fontSize="9" fontFamily="monospace" letterSpacing="2">RISK GATE</text>
        <line x1="255" y1="286" x2="255" y2="326" stroke="#22D3EE" strokeOpacity={stage >= 4 ? 0.55 : 0.12} strokeWidth="1"
          className={stage >= 4 && live ? 'flow-line' : undefined} style={{ animationDuration: '1.8s' }} />
        <rect x="185" y="326" width="140" height="34" rx="8" fill={live ? 'rgba(34,211,238,0.12)' : 'rgba(34,211,238,0.03)'} stroke={nodeColor(stage >= 4)} strokeWidth="1" />
        <text x="255" y="347" textAnchor="middle" fill={stage >= 4 ? (live ? '#22D3EE' : '#94A3B8') : '#475569'} fontSize="9" fontFamily="monospace" letterSpacing="2">
          {live ? 'EXECUTION AUTHORIZED' : 'EXECUTION · STANDBY'}
        </text>
      </svg>
      <p className="mt-2 text-center font-mono text-[0.6875rem] tracking-[0.2em] text-fog">SIGNAL → CONSENSUS → RISK → EXECUTION</p>
    </div>
  );
}
