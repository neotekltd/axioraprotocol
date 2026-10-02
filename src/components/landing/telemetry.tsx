'use client';

// Telemetry section: five-channel monitoring grid in the established
// technical visual language. Data arrives via the unified ProtocolTelemetry
// interface (src/lib/telemetry.ts):
// * production: REAL ledger aggregates + REAL daily series. Empty ledgers
//   render as honest zeros / flat baselines — never invented shapes.
// * demo (server env AXIORA_TELEMETRY_MODE=demo only): in-memory illustrative
//   constants, always badged DEMO DATA. Demo rows never enter the ledger.
// Charts carry no numeric claims beyond the series they plot; counters
// animate presentation of loaded values and settle on exact figures.

import { Reveal } from '@/components/Reveal';
import { TechEyebrow } from '@/components/landing/background';
import { useAnimatedNumber, useInViewOnce } from '@/components/landing/motion';
import { formatUSD } from '@/lib/finance';
import { launchLabel, type ProtocolTelemetry } from '@/lib/telemetry-shared';

const W = 160;
const H = 52;
const PAD = 4;

// Maps a numeric series onto SVG coordinates. Empty/all-zero series produce
// an honest flat baseline instead of an invented shape.
export function seriesPoints(series: number[]): [number, number][] {
  const n = Math.max(series.length, 2);
  const max = Math.max(0, ...series);
  return Array.from({ length: n }, (_, i) => {
    const v = series[i] ?? 0;
    const x = PAD + (i * (W - PAD * 2)) / (n - 1);
    const y = max > 0 ? H - PAD - (v / max) * (H - PAD * 2) : H - PAD;
    return [x, y] as [number, number];
  });
}

export function seriesPath(series: number[]): string {
  return seriesPoints(series)
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
}

function Sparkline({ series, go, id }: { series: number[]; go: boolean; id: string }) {
  const d = seriesPath(series);
  const last = seriesPoints(series).at(-1) ?? [W - PAD, H - PAD];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-[52px] w-full" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`tg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2FD6FF" stopOpacity="0.25" />
          <stop offset="1" stopColor="#2FD6FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[10, 24, 38].map((y) => (
        <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#94C5FF" strokeOpacity="0.08" strokeWidth="1" />
      ))}
      <path d={`${d} L${W - PAD},${H} L${PAD},${H} Z`} fill={`url(#tg-${id})`} />
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
      <line x1="0" y1={H - 2} x2={W} y2={H - 2} stroke="#2FD6FF" strokeOpacity="0.25" strokeWidth="1" />
    </svg>
  );
}

function Bars({ series, go }: { series: number[]; go: boolean }) {
  const windowed = series.slice(-14);
  const max = Math.max(1, ...windowed);
  return (
    <div className="mt-3 flex h-[52px] items-end gap-[5px]" aria-hidden="true">
      {windowed.map((v, i) => (
        <span
          key={i}
          style={{ height: `${Math.max(6, Math.round((v / max) * 100))}%`, transitionDelay: go ? `${i * 45}ms` : undefined }}
          className={`flex-1 rounded-[2px] transition-all duration-500 ${i >= windowed.length - 3 ? 'bg-[#2FD6FF]/80 shadow-[0_0_8px_rgba(47,214,255,0.45)]' : 'bg-[#1B2940]'} ${go ? 'opacity-100' : 'opacity-0'}`}
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

interface Channel {
  code: string;
  title: string;
  rawValue: number;
  caption: string;
  visual: 'spark' | 'bars' | 'timeline';
  series: number[];
}

function TelemetryCard({ ch, index, go, wide }: { ch: Channel; index: number; go: boolean; wide?: boolean }) {
  const display = useAnimatedNumber(ch.rawValue, go, 1100);
  const isMoney = index < 2;
  const formatted = isMoney
    ? formatUSD(display, { decimals: 0 })
    : Math.round(display).toLocaleString('en-US');
  return (
    <Reveal delay={index * 35} className={wide ? 'col-span-2 min-w-0' : 'min-w-0'}>
      <article
        className="group relative h-full min-w-0 overflow-hidden rounded-[20px] border border-[rgba(54,94,117,0.35)] bg-[linear-gradient(180deg,rgba(19,31,44,0.85),rgba(8,13,20,0.98))] p-5 transition-all duration-300 hover:-translate-y-[2px] hover:border-[rgba(47,214,255,0.45)] hover:shadow-[0_0_22px_rgba(47,214,255,0.12)] motion-reduce:transition-none motion-reduce:hover:transform-none sm:p-6"
      >
        <span aria-hidden="true" className="pointer-events-none absolute left-2 top-2 h-3 w-3 rounded-tl-md border-l-2 border-t-2 border-[#2FD6FF]/60" />
        <span aria-hidden="true" className="pointer-events-none absolute right-2 top-2 h-3 w-3 rounded-tr-md border-r-2 border-t-2 border-[#2FD6FF]/60" />
        <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-[#2FD6FF]">{ch.code}</div>
        <h3 className="mt-1.5 text-[19px] font-medium leading-tight text-[#AAB5C7]">{ch.title}</h3>
        <div className="mt-1 min-w-0 max-w-full overflow-hidden whitespace-nowrap font-mono text-[clamp(20px,7.8vw,29px)] font-bold leading-none tracking-tight tabular-nums text-white sm:text-[46px] lg:text-[54px]" aria-live="off" suppressHydrationWarning>
          {formatted}
        </div>
        <p className="mt-1 font-mono text-[12px] tracking-[0.08em] text-[#78859A]">{ch.caption}</p>
        {ch.visual === 'spark' && <Sparkline series={ch.series} go={go} id={ch.code} />}
        {ch.visual === 'bars' && <Bars series={ch.series} go={go} />}
        {ch.visual === 'timeline' && <Timeline days={ch.rawValue} go={go} />}
      </article>
    </Reveal>
  );
}

export function TelemetrySection({ data }: { data: ProtocolTelemetry | null }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.15);
  const demo = data?.mode === 'demo';
  const launched = data ? launchLabel(data.launchDate) : null;
  const channels: Channel[] = data
    ? [
        { code: 'CH-01', title: 'Deposited to date', rawValue: data.deposited, caption: demo ? 'Illustrative telemetry · USDT' : 'Ledger total · USDT', visual: 'spark', series: data.depositedSeries },
        { code: 'CH-02', title: 'Withdrawn by members', rawValue: data.withdrawn, caption: demo ? 'Illustrative telemetry' : 'Settled withdrawals', visual: 'spark', series: data.withdrawnSeries },
        { code: 'CH-03', title: 'Accounts', rawValue: data.accounts, caption: demo ? 'Illustrative telemetry' : 'Registered members', visual: 'spark', series: data.accountsSeries },
        { code: 'CH-04', title: 'Payouts made', rawValue: data.payouts, caption: demo ? 'Illustrative telemetry' : 'Credited payouts', visual: 'bars', series: data.payoutsSeries },
        { code: 'CH-05', title: 'Days in operation', rawValue: data.daysOperating, caption: launched ? `Running since ${launched}` : 'Operational uptime', visual: 'timeline', series: [] },
      ]
    : [];
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28" aria-label="Live protocol telemetry">
      <Reveal>
        <div className="flex flex-wrap items-center gap-3">
          <TechEyebrow index="05" label="TELEMETRY" />
          {demo && (
            <span className="rounded-md border border-[rgba(242,191,74,0.5)] bg-[rgba(242,191,74,0.08)] px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.18em] text-[#F2BF4A]">
              DEMO DATA
            </span>
          )}
        </div>
        <h2 className="mt-3 text-[38px] font-bold leading-[1.02] tracking-tight text-white sm:text-[44px]">
          <span className="block">Live readings</span>
          <span className="block">from the ledger.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-mist/80">
          {demo
            ? 'Illustrative telemetry — live ledger values appear when production activity is recorded.'
            : data
              ? 'Pulled from the Axiora ledger every time this page loads.'
              : 'No published figures yet — channels hold an awaiting-live-data state instead of invented numbers.'}
        </p>
      </Reveal>
      <div ref={ref} className="mt-14 grid grid-cols-2 gap-3 md:mt-16 lg:gap-4">
        {data ? (
          channels.map((ch, i) => <TelemetryCard key={ch.code} ch={ch} index={i} go={inView} wide={i === 4} />)
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
            <Reveal delay={4 * 35} className="col-span-2">
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
