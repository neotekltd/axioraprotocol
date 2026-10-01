'use client';

// Simulated-free live activity: renders ONLY real completed ledger records
// (latest completed deposits + withdrawals). With no records it shows
// polished empty states — never fabricated rows, never synthetic
// timestamps, never invented hashes. Polls the public aggregates endpoint;
// on failure it keeps last values with a SYNCING indicator (never demo data).

import { useEffect, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { useInViewOnce } from '@/components/landing/motion';
import { formatUSD } from '@/lib/finance';
import type { ActivityRow, HomepageActivity } from '@/lib/queries';

export function ageLabel(iso: string, now: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '—';
  const mins = Math.max(0, Math.round((now - t) / 60000));
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function useNow(intervalMs = 60000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function ActivityRowView({ r, incoming, index, go }: { r: ActivityRow; incoming: boolean; index: number; go: boolean }) {
  const now = useNow();
  const positive = incoming;
  return (
    <li
      style={{ transitionDelay: go ? `${index * 120}ms` : undefined }}
      className={`flex items-center gap-3 border-b border-[#202A3A]/60 px-4 py-3 text-[13px] transition-all duration-300 last:border-0 ${go ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      <span className="w-10 shrink-0 font-mono text-[12px] text-[#78859A]" suppressHydrationWarning>
        {ageLabel(r.occurredAt, now)}
      </span>
      <span className="w-12 shrink-0 font-mono text-[12px] font-bold text-white">{r.asset}</span>
      <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#78859A]">
        {r.txShort ?? '—'}
      </span>
      <span className="shrink-0 text-right">
        <span className={`block font-mono text-[13px] font-bold ${positive ? 'text-[#35D98B]' : 'text-white'}`}>
          {positive ? '+' : '−'}{formatUSD(Math.abs(r.amount))}
        </span>
        <span className="block text-[11px] text-[#78859A]">{incoming ? 'Deposit confirmed' : 'Withdrawal sent'}</span>
      </span>
      <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${incoming ? 'bg-[#2FD6FF] shadow-[0_0_8px_rgba(47,214,255,0.7)]' : 'bg-[#35D98B] shadow-[0_0_8px_rgba(53,217,139,0.7)]'}`} />
    </li>
  );
}

function Panel({ title, sub, rows, incoming, go }: {
  title: string;
  sub: string;
  rows: ActivityRow[];
  incoming: boolean;
  go: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#202A3A] bg-[#0C1119]">
      <div className="flex items-center justify-between border-b border-[#202A3A] px-5 py-3.5">
        <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-[#2FD6FF]">{title}</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#78859A]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#35D98B]" aria-hidden="true" /> LEDGER
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
            <ActivityRowView key={`${r.occurredAt}-${r.txShort ?? i}-${i}`} r={r} incoming={incoming} index={i} go={go} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function LiveActivity({ initial }: { initial: HomepageActivity }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.15);
  const [data, setData] = useState(initial);
  const [live, setLive] = useState(true);
  useEffect(() => {
    let dead = false;
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/telemetry', { cache: 'no-store' });
        if (!res.ok) throw new Error('bad status');
        const j = (await res.json()) as { activity?: HomepageActivity };
        if (!dead && j.activity) {
          setData(j.activity);
          setLive(true);
        }
      } catch {
        if (!dead) setLive(false);
      }
    }, 90000);
    return () => {
      dead = true;
      clearInterval(id);
    };
  }, []);
  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-20 md:px-8 md:pb-28" aria-label="Live ledger activity">
      <Reveal>
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.25em] text-[#AAB5C7]">Money moving right now</h2>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold ${live ? 'border-[rgba(53,217,139,0.4)] text-[#35D98B]' : 'border-[rgba(242,191,74,0.4)] text-[#F2BF4A]'}`} role="status">
            <span className={`h-1.5 w-1.5 rounded-full ${live ? 'animate-pulse bg-[#35D98B]' : 'bg-[#F2BF4A]'}`} aria-hidden="true" />
            {live ? 'LEDGER · LIVE' : 'LEDGER · SYNCING'}
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#78859A]">
          Latest confirmed deposits and completed withdrawals from the Axiora ledger. Nothing here is simulated.
        </p>
      </Reveal>
      <div ref={ref} className="mt-6 grid gap-4 md:grid-cols-2">
        <Reveal delay={0}>
          <Panel title="INCOMING.LOG" sub="Confirmed deposits" rows={data.incoming} incoming go={inView} />
        </Reveal>
        <Reveal delay={100}>
          <Panel title="OUTGOING.LOG" sub="Completed withdrawals" rows={data.outgoing} incoming={false} go={inView} />
        </Reveal>
      </div>
    </section>
  );
}
