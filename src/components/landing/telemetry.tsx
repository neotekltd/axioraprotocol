'use client';

// Telemetry section: five-channel monitoring grid in the established
// technical visual language. REAL DATA ONLY: values come exclusively from
// the homepage_telemetry() ledger aggregate (completed records, USDT
// accounting unit). No demo mode, no synthetic figures, no AIMEX numbers.
// With no data the section shows an explicit awaiting state.
// Micro-graphs/timeline are decorative instrumentation carrying no numeric
// claims; counters animate presentation of loaded ledger values.

import { Reveal } from '@/components/Reveal';
import { TechEyebrow } from '@/components/landing/background';
import { useAnimatedNumber, useInViewOnce } from '@/components/landing/motion';
import { formatUSD } from '@/lib/finance';
import type { HomepageTelemetry } from '@/lib/queries';

interface Channel {
  code: string;
  title: string;
  rawValue: number;
  caption: string;
  visual: 'spark' | 'bars' | 'timeline';
  seed: number;
}

function Sparkline({ seed, go, id }: { seed: number; go: boolean; id: string }) {
  // Deterministic pseudo-telemetry polyline (decorative instrumentation).
  const pts: [number, number][] = [];
  let v = 34 + (seed % 7);
  for (let i = 0; i <= 24; i++) {
    v += ((seed * (i + 3)) % 11) - 5;
    v = Math.max(6, Math.min(44, v));
    pts.push([4 + (i * 152) / 24, 48 - v]);
  }
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 160 52" className="mt-3 h-[52px] w-full" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`tg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2FD6FF" stopOpacity="0.25" />
          <stop offset="1" stopColor="#2FD6FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[10, 24, 38].map((y) => (
        <line key={y} x1="0" y1={y} x2="160" y2={y} stroke="#94C5FF" strokeOpacity="0.08" strokeWidth="1" />
      ))}
      <path d={`${d} L156,52 L4,52 Z`} fill={`url(#tg-${id})`} />
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke="#2FD6FF"
        strokeOpacity="0.85"
        strokeWidth="1.5"
        className={go ? 'tele-draw' : undefined}
        style={{ filter: 'drop-shadow(0 0 5px rgba(47,214,255,0.5))' }}
      />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill="#2FD6FF" className="pulse-node" />
      <line x1="0" y1="50" x2="160" y2="50" stroke="#2FD6FF" strokeOpacity="0.25" strokeWidth="1" />
    </svg>
  );
}

function Bars({ seed, go }: { seed: number; go: boolean }) {
  const heights = Array.from({ length: 14 }, (_, i) => 22 + ((seed * (i + 5)) % 60));
  return (
    <div className="mt-3 flex h-[52px] items-end gap-[5px]" aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          style={{ height: `${h}%`, transitionDelay: go ? `${i * 45}ms` : undefined }}
          className={`flex-1 rounded-[2px] transition-all duration-500 ${i >= heights.length - 3 ? 'bg-[#2FD6FF]/80 shadow-[0_0_8px_rgba(47,214,255,0.45)]' : 'bg-[#1B2940]'} ${go ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </div>
  );
}

function Timeline({ days, go }: { days: number; go: boolean }) {
  const cells = 10;
  const done = Math.max(0, Math.min(cells, days));
  return (
    <div className="mt-3" aria-hidden="true">
      <div className="flex gap-[5px]">
        {Array.from({ length: cells }, (_, i) => (
          <span
            key={i}
            style={{ transitionDelay: go ? `${i * 50}ms` : undefined }}
            className={`h-[16px] flex-1 rounded-[3px] transition-all duration-500 ${
              i < done - 1
                ? 'bg-[#14505F]'
                : i === done - 1 && done > 0
                  ? 'bg-[#2FD6FF] shadow-[0_0_10px_rgba(47,214,255,0.6)]'
                  : 'bg-[#101B29]'
            } ${go ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
    </div>
  );
}

function TelemetryCard({ ch, index, go }: { ch: Channel; index: number; go: boolean }) {
  const display = useAnimatedNumber(ch.rawValue, go, 1100);
  const isMoney = index < 2;
  const formatted = isMoney
    ? formatUSD(display, { decimals: 0 })
    : Math.round(display).toLocaleString('en-US');
  return (
    <Reveal delay={index * 35} className={ch.visual === 'timeline' ? 'col-span-2 lg:col-span-1' : undefined}>
      <article
        className="group relative h-full overflow-hidden rounded-[20px] border border-[rgba(54,94,117,0.35)] bg-[linear-gradient(180deg,rgba(19,31,44,0.85),rgba(8,13,20,0.98))] p-5 transition-all duration-300 hover:-translate-y-[2px] hover:border-[rgba(47,214,255,0.45)] hover:shadow-[0_0_22px_rgba(47,214,255,0.12)] motion-reduce:transition-none motion-reduce:hover:transform-none"
      >
        <span aria-hidden="true" className="pointer-events-none absolute left-2 top-2 h-3 w-3 rounded-tl-md border-l-2 border-t-2 border-[#2FD6FF]/60" />
        <span aria-hidden="true" className="pointer-events-none absolute right-2 top-2 h-3 w-3 rounded-tr-md border-r-2 border-t-2 border-[#2FD6FF]/60" />
        <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-[#2FD6FF]">{ch.code}</div>
        <h3 className="mt-1.5 text-[19px] font-medium leading-tight text-[#AAB5C7]">{ch.title}</h3>
        <div className="mt-1 font-mono text-[46px] font-bold leading-[1.05] tracking-tight text-white" aria-live="off" suppressHydrationWarning>
          {formatted}
        </div>
        <p className="mt-1 font-mono text-[12px] tracking-[0.08em] text-[#78859A]">{ch.caption}</p>
        {ch.visual === 'spark' && <Sparkline seed={ch.seed} go={go} id={ch.code} />}
        {ch.visual === 'bars' && <Bars seed={ch.seed} go={go} />}
        {ch.visual === 'timeline' && (
          <>
            <p className="mt-2 flex items-center gap-2 text-[13px] text-[#AAB5C7]">
              <span className="h-2 w-2 rounded-full bg-[#35D98B] shadow-[0_0_8px_rgba(53,217,139,0.8)]" aria-hidden="true" />
              Active · {ch.rawValue} day{ch.rawValue === 1 ? '' : 's'} in operation
            </p>
            <Timeline days={ch.rawValue} go={go} />
          </>
        )}
      </article>
    </Reveal>
  );
}

export function TelemetrySection({ data }: { data: HomepageTelemetry | null }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.15);
  const channels: Channel[] = data
    ? [
        { code: 'CH-01', title: 'Deposited to date', rawValue: data.depositedToDate, caption: 'Ledger total · USDT', visual: 'spark', seed: 7 },
        { code: 'CH-02', title: 'Withdrawn by members', rawValue: data.withdrawnByMembers, caption: 'Settled withdrawals', visual: 'spark', seed: 21 },
        { code: 'CH-03', title: 'Accounts', rawValue: data.accounts, caption: 'Registered members', visual: 'spark', seed: 13 },
        { code: 'CH-04', title: 'Payouts made', rawValue: data.payoutsMade, caption: 'Credited payouts', visual: 'bars', seed: 5 },
        { code: 'CH-05', title: 'Days in operation', rawValue: data.daysInOperation, caption: '', visual: 'timeline', seed: 0 },
      ]
    : [];
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28" aria-label="Live protocol telemetry">
      <Reveal>
        <TechEyebrow index="05" label="TELEMETRY" />
        <h2 className="mt-3 text-[38px] font-bold leading-[1.02] tracking-tight text-white sm:text-[44px]">
          <span className="block">Live readings</span>
          <span className="block">from the ledger.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-mist/80">
          {data
            ? 'Pulled from the Axiora ledger every time this page loads.'
            : 'No published figures yet — channels hold an awaiting-live-data state instead of invented numbers.'}
        </p>
      </Reveal>
      <div ref={ref} className="mt-14 grid grid-cols-2 gap-3 sm:gap-3 md:mt-16 lg:grid-cols-5 lg:gap-4">
        {data ? (
          channels.map((ch, i) => <TelemetryCard key={ch.code} ch={ch} index={i} go={inView} />)
        ) : (
          <>
            {['DEPOSITED', 'WITHDRAWN', 'ACCOUNTS', 'PAYOUTS'].map((label, i) => (
              <Reveal key={label} delay={i * 35}>
                <div className="rounded-[20px] border border-dashed border-line bg-panel/50 p-5">
                  <div className="font-mono text-[12px] tracking-[0.2em] text-fog">{label}</div>
                  <div className="mt-2 font-mono text-base font-bold tracking-[0.12em] text-fog">AWAITING LIVE DATA</div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={4 * 35} className="col-span-2 lg:col-span-1">
              <div className="rounded-[20px] border border-dashed border-line bg-panel/50 p-5">
                <div className="font-mono text-[12px] tracking-[0.2em] text-fog">DAYS ONLINE</div>
                <div className="mt-2 font-mono text-base font-bold tracking-[0.12em] text-fog">AWAITING LIVE DATA</div>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}
