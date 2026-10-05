'use client';

// Interactive specifications: hovering a row illuminates the corresponding
// element in the system visual. Pure state-driven SVG + CSS, no layout anim.

import { useState } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { TechEyebrow } from '@/components/landing/background';
import { useT } from '@/components/LanguageProvider';

const NUMS = ['01', '02', '03', '04'];

const ORBITALS = [
  { x: 200, y: 69 }, { x: 296, y: 150 }, { x: 200, y: 231 }, { x: 104, y: 150 },
];

export function SpecsInteractive() {
  const t = useT();
  const [active, setActive] = useState<number | null>(null);
  const SPECS = t.specs.map((s, i) => [NUMS[i], s.t, s.b, s.m] as const);
  return (
    <section className="border-b border-white/5 bg-void/60" aria-label={t.spec.specAria}>
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <div className="rounded-2xl border border-line bg-panel/70 p-6 sm:p-8">
            <div className="font-mono text-[10px] tracking-[0.25em] text-fog">{t.spec.coreLbl}</div>
            <svg viewBox="0 0 400 300" className="mt-4 w-full" role="img" aria-label={t.spec.sysDiagram}>
              {[130, 96, 62].map((r, i) => (
                <ellipse
                  key={r} cx="200" cy="150" rx={r} ry={r * 0.62}
                  fill="none" stroke="#22D3EE" strokeOpacity={active === null ? 0.35 - i * 0.08 : active === i % 4 ? 0.8 : 0.12}
                  strokeDasharray={i === 1 ? '5 5' : undefined}
                  className={i === 1 ? 'flow-line' : undefined}
                  style={{ ...{ transition: 'stroke-opacity 0.25s ease' }, ...(i === 1 ? { animationDuration: '3s' } : {}) }}
                />
              ))}
              {ORBITALS.map((p, i) => {
                const lit = active === null || active === i;
                return (
                  <g key={i} opacity={lit ? 1 : 0.3} style={{ transition: 'opacity 0.25s ease' }}>
                    <circle cx={p.x} cy={p.y} r="11" fill="rgba(34,211,238,0.07)" stroke="#22D3EE" strokeOpacity={active === i ? 1 : 0.55} strokeWidth={active === i ? 2 : 1} />
                    <circle cx={p.x} cy={p.y} r="3" fill="#22D3EE" className="pulse-node" style={{ animationDelay: `${i * 0.5}s` }} />
                  </g>
                );
              })}
              <rect x="178" y="128" width="44" height="44" rx="10" fill="rgba(34,211,238,0.1)" stroke="#22D3EE" />
              <circle cx="200" cy="150" r="7" fill="#22D3EE" className="ping-soft" />
            </svg>
            <p className="mt-4 text-xs leading-relaxed text-fog">{t.spec.renderNote}</p>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <TechEyebrow index="04" label={t.spec.specAria.toUpperCase()} />
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{t.spec.specT}</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mist/75">{t.spec.specS}</p>
          </Reveal>
          <div className="mt-6 space-y-2.5">
            {SPECS.map(([n, t, b, m], i) => (
              <Reveal key={n} delay={i * 90}>
                <div
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  className={`card-sweep flex gap-3.5 rounded-xl border bg-panel/70 p-4 transition ${active === i ? 'border-pulse/70 shadow-glow' : 'border-line hover:border-pulse/50'}`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border font-mono text-[11px] font-bold transition ${active === i ? 'border-pulse/60 bg-pulse/[0.12] text-pulse' : 'border-pulse/30 bg-pulse/[0.07] text-pulse'}`} aria-hidden="true">{n}</span>
                  <div>
                    <div className={`text-[15px] font-bold transition ${active === i ? 'text-white' : ''}`}>{t}</div>
                    <p className="mt-1 text-[13px] leading-relaxed text-fog">{b}</p>
                    <div className="mt-1.5 font-mono text-[10px] tracking-[0.2em] text-fog">{m}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <p className="mt-4 text-xs text-fog">{t.spec.specFull} <Link href="/security" className="text-pulse">{t.spec.secPage}</Link>.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
