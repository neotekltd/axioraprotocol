'use client';

// Homepage live activity: INCOMING/OUTGOING panels fed by the unified
// HomepageFeed (src/lib/activity-shared.ts + getHomepageFeed).
// * demo: deterministic reference rows, badged DEMO ACTIVITY, static ages,
//   no polling (demo rows must never be overwritten by ledger zeros).
// * real: confirmed ledger rows, LEDGER · LIVE badge, ages tick from the
//   server timestamp, 90s refresh. Empty ledger = honest empty states.
// No random generation, no timers manufacturing events, no ledger writes.

import { useEffect, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { useInViewOnce } from '@/components/landing/motion';
import { formatUSD } from '@/lib/finance';
import { ageLabel } from '@/components/landing/live-activity-utils';
import { coinIconSrc, type FeedRow, type HomepageFeed } from '@/lib/activity-shared';
import type { HomepageActivity } from '@/lib/queries';

function useNow(intervalMs = 60000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function AssetMark({ asset }: { asset: string }) {
  const src = coinIconSrc(asset);
  if (!src) {
    return <span className="w-12 shrink-0 font-mono text-[12px] font-bold text-white">{asset}</span>;
  }
  return (
    <span className="flex w-12 shrink-0 items-center gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4 shrink-0" />
      <span className="font-mono text-[12px] font-bold text-white">{asset}</span>
    </span>
  );
}

function ActivityRowView({ r, index, go }: { r: FeedRow; index: number; go: boolean }) {
  const now = useNow();
  const shown = r.occurredAt ? ageLabel(r.occurredAt, now) : r.age;
  return (
    <li
      style={{ transitionDelay: go ? `${index * 55}ms` : undefined }}
      className={`flex min-w-0 items-center gap-3 border-b border-[#202A3A]/60 px-4 py-3 text-[13px] transition-all duration-300 last:border-0 hover:bg-[rgba(47,214,255,0.04)] motion-reduce:transition-none ${go ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      <span className="w-10 shrink-0 font-mono text-[12px] text-[#78859A]" suppressHydrationWarning>
        {shown}
      </span>
      <AssetMark asset={r.asset} />
      <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#78859A]">
        {r.middle}
      </span>
      <span className="shrink-0 whitespace-nowrap text-right tabular-nums">
        <span className={`block font-mono text-[13px] font-bold tabular-nums ${r.incoming ? 'text-[#35D98B]' : 'text-white'}`}>
          {r.incoming ? '+' : '−'}{formatUSD(Math.abs(r.amount))}
        </span>
        <span className="block text-[11px] text-[#78859A]">{r.action}</span>
      </span>
      <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.incoming ? 'bg-[#2FD6FF] shadow-[0_0_8px_rgba(47,214,255,0.7)]' : 'bg-[#35D98B] shadow-[0_0_8px_rgba(53,217,139,0.7)]'}`} />
    </li>
  );
}

function Panel({ title, sub, rows, incoming, go }: {
  title: string;
  sub: string;
  rows: FeedRow[];
  incoming: boolean;
  go: boolean;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[20px] border border-[#202A3A] bg-[#0C1119]">
      <div className="flex items-center justify-between border-b border-[#202A3A] px-5 py-3.5">
        <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-[#2FD6FF]">{title}</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#78859A]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#35D98B]" aria-hidden="true" /> {incoming ? 'IN' : 'OUT'}
        </span>
      </div>
      <p className="px-5 pt-3 text-[12px] text-[#78859A]">{sub}</p>
      {rows.length === 0 ? (
        <p className="px-5 py-6 text-center text-[13px] text-[#78859A]">
          {incoming ? 'No confirmed deposits yet.' : 'No completed withdrawals yet.'}
        </p>
      ) : (
        <ul className="mt-1 pb-1">
          {rows.map((r, i) => (
            <ActivityRowView key={r.key} r={r} index={i} go={go} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function LiveActivity({ initial }: { initial: HomepageFeed }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.15);
  const [data, setData] = useState(initial);
  const [live, setLive] = useState(true);
  const demo = initial.mode === 'demo';
  const aimex = initial.mode === 'aimex';
  // Fixed presentation sets (demo staging reference, aimex sourced feed):
  // never poll, never overwrite with ledger zeros.
  const staticFeed = demo || aimex;
  useEffect(() => {
    if (staticFeed) return;
    let dead = false;
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/telemetry', { cache: 'no-store' });
        if (!res.ok) throw new Error('bad status');
        const j = (await res.json()) as { activity?: HomepageActivity };
        if (!dead && j.activity) {
          const mapRow = (r: HomepageActivity['incoming'][number], i: number, incoming: boolean): FeedRow => ({
            key: `${r.occurredAt}-${r.txShort ?? i}-${i}`,
            age: '',
            occurredAt: r.occurredAt,
            asset: r.asset,
            middle: r.txShort ?? '—',
            action: incoming ? 'Deposit confirmed' : 'Withdrawal sent',
            amount: r.amount,
            incoming,
          });
          if (!dead) {
            setData({
              mode: 'real',
              incoming: (j.activity.incoming ?? []).map((r, i) => mapRow(r, i, true)),
              outgoing: (j.activity.outgoing ?? []).map((r, i) => mapRow(r, i, false)),
            });
            setLive(true);
          }
        }
      } catch {
        if (!dead) setLive(false);
      }
    }, 90000);
    return () => {
      dead = true;
      clearInterval(id);
    };
  }, [staticFeed]);
  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-20 md:px-8 md:pb-28" aria-label="Live ledger activity">
      <Reveal>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.25em] text-[#AAB5C7]">Money moving right now</h2>
          {demo ? (
            <span className="rounded-md border border-[rgba(242,191,74,0.5)] bg-[rgba(242,191,74,0.08)] px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.18em] text-[#F2BF4A]">
              DEMO ACTIVITY
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold ${live ? 'border-[rgba(53,217,139,0.4)] text-[#35D98B]' : 'border-[rgba(242,191,74,0.4)] text-[#F2BF4A]'}`} role="status">
              <span className={`h-1.5 w-1.5 rounded-full ${live ? 'animate-pulse bg-[#35D98B]' : 'bg-[#F2BF4A]'}`} aria-hidden="true" />
              {live ? 'LIVE' : 'SYNCING'}
            </span>
          )}
          {aimex && (
            <span className="font-mono text-[10px] tracking-[0.22em] text-[#596579]">
              SOURCE · AIMEX
            </span>
          )}
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#78859A]">
          {demo
            ? 'Reference activity for illustration — live ledger records appear once confirmed deposits exist.'
            : aimex
              ? 'Sourced activity served from the configured homepage feed.'
              : 'Latest confirmed deposits and completed withdrawals from the Axiora ledger. Nothing here is simulated.'}
        </p>
      </Reveal>
      <div ref={ref} className="mt-6 grid gap-4 md:grid-cols-2">
        <Reveal delay={0} className="min-w-0">
          <Panel title="INCOMING.LOG" sub={demo ? 'Reference deposits' : aimex ? 'Sourced feed' : 'Confirmed deposits'} rows={data.incoming} incoming go={inView} />
        </Reveal>
        <Reveal delay={100} className="min-w-0">
          <Panel title="OUTGOING.LOG" sub={demo ? 'Reference withdrawals' : aimex ? 'Sourced feed' : 'Completed withdrawals'} rows={data.outgoing} incoming={false} go={inView} />
        </Reveal>
      </div>
    </section>
  );
}
