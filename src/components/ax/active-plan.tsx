'use client';

// Active plan card with the next-payout countdown. All money and timestamps
// arrive as props from the server (authoritative ledger state). The browser
// only animates the countdown display: when the timer reaches zero it
// re-fetches server state via router.refresh() — it never credits anything
// locally.

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxCard } from '@/components/ax/primitives';
import { formatUSD, formatPct } from '@/lib/plans';
import type { ActivePlan } from '@/lib/queries';

export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(sec)}`;
}

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function PayoutCountdown({ nextPayoutAt }: { nextPayoutAt: string | null }) {
  const router = useRouter();
  const now = useNow(1000);
  const refreshedAtZero = useRef(false);
  const target = useMemo(
    () => (nextPayoutAt ? new Date(nextPayoutAt).getTime() : NaN),
    [nextPayoutAt]
  );
  const remaining = Number.isFinite(target) ? target - now : NaN;

  useEffect(() => {
    if (!Number.isFinite(remaining)) return;
    if (remaining <= 0 && !refreshedAtZero.current) {
      refreshedAtZero.current = true;
      // Ask the server for fresh authoritative state; the server-side
      // processor credits the due payout during that render.
      const t = setTimeout(() => router.refresh(), 1500);
      return () => clearTimeout(t);
    }
  }, [remaining, router]);

  useEffect(() => {
    refreshedAtZero.current = false;
  }, [nextPayoutAt]);

  if (!Number.isFinite(remaining)) {
    return (
      <div>
        <div className="text-[12px] tracking-[0.12em] text-[#78859A]">NEXT PAYOUT</div>
        <div className="mt-1 font-mono text-[28px] font-bold text-white">—</div>
      </div>
    );
  }
  if (remaining <= 0) {
    return (
      <div aria-live="polite">
        <div className="text-[12px] tracking-[0.12em] text-[#F2BF4A]">PAYOUT PROCESSING</div>
        <div className="mt-1 font-mono text-[28px] font-bold text-[#F2BF4A]">···</div>
        <p className="mt-1 text-[12px] text-[#78859A]">Settling on the ledger…</p>
      </div>
    );
  }
  return (
    <div aria-live="off">
      <div className="text-[12px] tracking-[0.12em] text-[#78859A]">NEXT PAYOUT</div>
      <div className="mt-1 font-mono text-[28px] font-bold tabular-nums text-white" aria-label={`Next payout in ${formatCountdown(remaining)}`}>
        {formatCountdown(remaining)}
      </div>
    </div>
  );
}

export function ActivePlanCard({ plan }: { plan: ActivePlan }) {
  return (
    <AxCard variant="active" className="p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] text-[#78859A]">ACTIVE PLAN · {plan.ref}</div>
          <div className="mt-0.5 text-[22px] font-bold tracking-tight text-white">{plan.planName}</div>
        </div>
        <span className="rounded-full border border-[rgba(53,217,139,0.5)] bg-[rgba(53,217,139,0.1)] px-3 py-1 font-mono text-[11px] font-bold tracking-[0.12em] text-[#35D98B]">
          {plan.status.toUpperCase()}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[12px] text-[#78859A]">Invested</div>
          <div className="mt-0.5 font-mono text-[18px] font-bold text-white">{formatUSD(plan.amount)}</div>
        </div>
        <div>
          <div className="text-[12px] text-[#78859A]">Rate</div>
          <div className="mt-0.5 font-mono text-[18px] font-bold text-[#2FD6FF]">
            {formatPct(plan.ratePerCredit * 100)}<span className="ml-1 font-sans text-[12px] font-normal text-[#78859A]">every {plan.cycleHours}h</span>
          </div>
        </div>
        <div>
          <div className="text-[12px] text-[#78859A]">Earned</div>
          <div className="mt-0.5 font-mono text-[18px] font-bold text-[#35D98B]">{formatUSD(plan.earnedTotal)}</div>
        </div>
        <div>
          <div className="text-[12px] text-[#78859A]">Payouts</div>
          <div className="mt-0.5 font-mono text-[18px] font-bold text-white">
            {plan.payoutsCompleted}{plan.payoutsTotal != null ? ` / ${plan.payoutsTotal}` : ''}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[14px] border border-[#202A3A] bg-[#080B12] p-4">
        <PayoutCountdown nextPayoutAt={plan.nextPayoutAt} />
        <div className="mt-2 flex items-center justify-between border-t border-[#202A3A] pt-2 text-[13px]">
          <span className="text-[#78859A]">Estimated scheduled credit</span>
          <span className="font-mono font-bold text-[#2FD6FF]">{formatUSD(plan.nextCredit)}</span>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <Link href="/app/withdraw" className="flex min-h-[48px] flex-1 items-center justify-center rounded-[12px] bg-[#2FD6FF] text-[14px] font-bold text-[#06121A] transition hover:brightness-110 active:scale-[0.99]">
          Withdraw earnings
        </Link>
        <Link href="/app/deployments" className="flex min-h-[48px] flex-1 items-center justify-center rounded-[12px] border border-[#2A394D] bg-[#111722] text-[14px] font-bold text-white transition hover:border-[rgba(47,214,255,0.5)] active:scale-[0.99]">
          Payout history
        </Link>
      </div>
    </AxCard>
  );
}
