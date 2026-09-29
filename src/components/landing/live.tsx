'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { FaqAccordion } from '@/components/FaqAccordion';
import { NetworkViz } from '@/components/landing/network-viz';
import { TechEyebrow } from '@/components/landing/background';
import { useAnimatedNumber, useInViewOnce } from '@/components/landing/motion';
import { PROTOCOL_CONFIG } from '@/lib/config';
import { formatUSD } from '@/lib/finance';
import { FAQS } from '@/lib/mock';
import type { ProtocolStats } from '@/lib/queries';

function MetricCard({ id, label, value, sub, started, index, money }: {
  id: string; label: string; value: number; sub: string; started: boolean; index: number; money?: boolean;
}) {
  const display = useAnimatedNumber(value, started, 1100);
  const formatted = money ? formatUSD(display, { decimals: 0 }) : Math.round(display).toLocaleString('en-US');
  return (
    <Reveal delay={Math.min(index, 2) * 90}>
      <div className="card-sweep rounded-xl border border-line bg-panel/80 p-5 transition hover:border-pulse/50">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-fog">
          <span>{label}</span>
          <span className="flex items-center gap-1.5 text-pulse" aria-label="live channel">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pulse" />
          </span>
        </div>
        <div className="mt-2 font-mono text-[1.65rem] font-bold tracking-tight text-white">{formatted}</div>
        <div className="mt-1 text-[11px] text-fog">{sub}</div>
      </div>
    </Reveal>
  );
}

export function TelemetrySection({ stats }: { stats: ProtocolStats | null }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.2);
  const metrics = stats
    ? [
        { id: 'deposited', label: 'DEPOSITED TO DATE', value: stats.deposited, sub: `Ledger total${stats.updatedAt ? ` · ${stats.updatedAt.slice(0, 10)}` : ''}`, money: true },
        { id: 'withdrawn', label: 'WITHDRAWN BY MEMBERS', value: stats.withdrawn, sub: 'Settled withdrawals', money: true },
        { id: 'accounts', label: 'ACCOUNTS', value: stats.accounts, sub: 'Verified members' },
        { id: 'payouts', label: 'PAYOUTS MADE', value: stats.payouts, sub: 'Credited payouts' },
        { id: 'days', label: 'DAYS IN OPERATION', value: stats.daysOperation, sub: 'Since launch' },
      ]
    : [];
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28" aria-label="Live protocol telemetry">
      <Reveal>
        <TechEyebrow index="05" label="TELEMETRY" />
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Live readings from the ledger.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist/75">
          {stats
            ? 'Pulled from the books — every figure traces to ledger records.'
            : 'No published figures yet — channels hold an awaiting-live-data state instead of invented numbers.'}
        </p>
      </Reveal>
      <div ref={ref} className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats
          ? metrics.map((m, i) => <MetricCard key={m.id} {...m} started={inView} index={i} />)
          : ['DEPOSITED', 'WITHDRAWN', 'ACCOUNTS', 'PAYOUTS', 'DAYS ONLINE'].map((label, i) => (
              <Reveal key={label} delay={Math.min(i, 2) * 90}>
                <div className="rounded-xl border border-dashed border-line bg-panel/50 p-4">
                  <div className="font-mono text-[10px] tracking-[0.2em] text-fog">{label}</div>
                  <div className="mt-2 font-mono text-base font-bold tracking-[0.12em] text-fog">AWAITING LIVE DATA</div>
                  <div className="relative mt-2 h-[3px] overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
                    <span className="signal-x" style={{ animationDuration: '2.8s' }} />
                  </div>
                  <div className="mt-1.5 text-[11px] text-fog">No snapshot published</div>
                </div>
              </Reveal>
            ))}
      </div>
      {!stats && (
        <Reveal delay={100}>
          <div className="mt-4 text-sm"><Link href="/statistics" className="text-pulse hover:brightness-110">Open the statistics page →</Link></div>
        </Reveal>
      )}
    </section>
  );
}

function ActivityPanel({ kind }: { kind: 'INCOMING' | 'OUTGOING' }) {
  return (
    <div className="rounded-xl border border-line bg-panel/70">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-pulse">{kind}</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-fog">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pulse" aria-hidden="true" /> LISTENING
        </span>
      </div>
      <div className="flex items-center justify-between border-b border-line/50 px-5 py-2 font-mono text-[10px] tracking-[0.18em] text-fog">
        <span>PUBLISHED BATCHES</span>
        <span className="text-mist">0</span>
      </div>
      <div className="p-8 text-center">
        <div className="font-bold text-mist/80">Awaiting live activity</div>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-fog">
          {kind === 'INCOMING'
            ? 'Deposits publish here with truncated identifiers once the first audited batch lands.'
            : 'Withdrawals and settlements publish here — real rows or nothing.'}
        </p>
      </div>
    </div>
  );
}

export function ActivitySection() {
  return (
    <section className="border-y border-white/5 bg-void/60" aria-label="Protocol activity">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <TechEyebrow index="06" label="ACTIVITY" />
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Money moving right now.</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist/75">Individual accounts stay private. Only protocol-level batches are ever published — never simulated.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Reveal><ActivityPanel kind="INCOMING" /></Reveal>
          <Reveal delay={100}><ActivityPanel kind="OUTGOING" /></Reveal>
        </div>
      </div>
    </section>
  );
}

export function ReferralNetworkSection() {
  const [level, setLevel] = useState<number | null>(null);
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28" aria-label="Referral network">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Reveal>
            <TechEyebrow index="07" label="REFERRALS" />
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Build a network that pays you back.</h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-mist/75">Axiora&apos;s own five-level structure — instant bonuses plus daily shares, snapshotted per reward.</p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-8 space-y-2" onMouseLeave={() => setLevel(null)}>
              {PROTOCOL_CONFIG.referralLevels.slice(0, 3).map((r) => (
                <div
                  key={r.level}
                  onMouseEnter={() => setLevel(r.level)}
                  onFocus={() => setLevel(r.level)}
                  tabIndex={0}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition ${level === r.level ? 'border-pulse/70 bg-pulse/[0.06] shadow-glow' : 'border-line bg-panel/70 hover:border-pulse/40'}`}
                >
                  <span className={`font-mono font-bold ${level === r.level ? 'text-pulse' : 'text-white'}`}>L{r.level}</span>
                  <span className="font-mono text-xs text-fog">{r.instantPct}% instant · {r.dailySharePct}% daily</span>
                </div>
              ))}
              <p className="pt-1 text-xs text-fog">+ L4–L5 deeper levels — full table on the <Link href="/referrals" className="text-pulse">Referrals page</Link>.</p>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-lg bg-pulse px-6 py-3 text-sm font-bold text-black transition hover:brightness-110">Create account to get your link</Link>
              <Link href="/referrals" className="rounded-lg border border-line px-6 py-3 text-sm hover:border-pulse/50">How referrals work</Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={120}>
          <div className="mx-auto w-full max-w-md rounded-2xl border border-line bg-panel/50 p-5">
            <div className="font-mono text-[10px] tracking-[0.25em] text-fog">NETWORK TOPOLOGY · LIVE MODEL</div>
            <div className="mt-1"><NetworkViz highlight={level} /></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FaqDiagnostics() {
  const items = FAQS.slice(0, 7).map((f) => ({ q: f.q, a: f.a }));
  return (
    <section className="border-y border-white/5 bg-void/60" aria-label="FAQ and diagnostics">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <TechEyebrow index="08" label="INFORMATION" />
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered.</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-mist/75">Straight answers on money, timing and access. Anything deeper lives on the FAQ page.</p>
          <div className="mt-6">
            <Link href="/faq" className="inline-block rounded-lg border border-line px-5 py-2.5 text-sm transition hover:border-pulse/50">Open all questions</Link>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="overflow-hidden rounded-xl border border-line bg-[#070b12]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-2 font-mono text-[10px] tracking-[0.2em] text-fog">axiora://diagnostics</span>
            </div>
            <div className="p-3"><FaqAccordion items={items} numbered /></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-20 md:px-8">
      <Reveal>
        <div className="relative mt-16 overflow-hidden rounded-3xl border border-pulse/25 bg-[#060b13] p-8 text-center sm:p-14">
          <div className="tech-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="absolute left-1/2 top-0 h-40 w-[36rem] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.14),transparent_70%)]" aria-hidden="true" />
          <div className="relative">
            <div className="ping-soft mx-auto grid h-12 w-12 place-items-center rounded-full border border-pulse/50 bg-pulse/10 font-mono text-sm font-bold text-pulse">A×</div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Switch it on.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-fog">Deposits, modules, payouts and withdrawals — one account, tracked end to end.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="rounded-lg bg-pulse px-7 py-3 text-sm font-bold text-black shadow-glow transition hover:-translate-y-0.5 hover:brightness-110">Activate account</Link>
              <Link href="#modules" className="rounded-lg border border-line px-7 py-3 text-sm transition hover:border-pulse/50 hover:text-white">View the modules</Link>
            </div>
          </div>
        </div>
      </Reveal>
      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-fog">
        Risk disclaimer: trading crypto assets involves substantial risk of loss, up to and including total loss.
        Calculator figures and quotes are estimates, not promises. Past simulated performance proves nothing.
        Never deploy capital you cannot afford to lose. Nothing on this page is financial advice.
      </p>
    </div>
  );
}
