'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/data';
import { AxButton } from '@/components/ax/controls';
import { AxCard } from '@/components/ax/primitives';
import { PLANS, getPlan, formatUSD, formatPct, type PlanKey, type PlanQuote } from '@/lib/plans';
import { createDeployment } from '@/lib/actions';

export function DeployForm({ available, hasFunds }: { available: number; hasFunds: boolean }) {
  const router = useRouter();
  const [amount, setAmount] = useState(1000);
  const [planKey, setPlanKey] = useState<PlanKey>('premium');
  const [quote, setQuote] = useState<PlanQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = getPlan(planKey) ?? PLANS[1];

  const selectPlan = (key: PlanKey) => {
    const next = getPlan(key) ?? PLANS[1];
    setPlanKey(key);
    setAmount((a) => Math.min(Math.max(a || next.min, next.min), next.max));
  };

  useEffect(() => {
    let cancelled = false;
    setQuoteError(null);
    setQuote(null);
    fetch(`/api/deployments/quote?amount=${amount}&plan=${planKey}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.message || 'quote failed');
        if (!cancelled) setQuote(j.quote as PlanQuote);
      })
      .catch((e: unknown) => {
        if (!cancelled) setQuoteError(e instanceof Error ? e.message : 'Could not load the server quote.');
      });
    return () => {
      cancelled = true;
    };
  }, [amount, planKey]);

  const activate = async () => {
    setBusy(true);
    setError(null);
    const res = await createDeployment({ amount, plan: planKey });
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setConfirming(false);
    router.replace(res.ref ? `/app/deployments/${res.ref}` : '/app/deployments');
    router.refresh();
  };

  return (
    <div>
      <PageHeader title="Deploy Capital" sub="Activate a module from your available balance. Quotes are computed server-side." />
      {!hasFunds && (
        <AxCard className="mt-6 border-[rgba(242,191,74,0.4)] p-6 text-center">
          <div className="font-bold text-white">Available balance is $0.00</div>
          <p className="mx-auto mt-1 max-w-sm text-[14px] text-[#AAB5C7]">Deployments draw from deposited funds. Deposit first, then return here to activate.</p>
          <Link href="/app/deposit" className="mt-4 inline-flex min-h-[48px] items-center rounded-[14px] bg-[#2FD6FF] px-6 text-[14px] font-bold text-[#06121A] hover:brightness-110">Deposit funds</Link>
        </AxCard>
      )}
      <AxCard className="mt-6 p-6 sm:p-7">
        <div className="text-[14px] text-[#AAB5C7]">Available Balance <span className="font-mono font-bold text-white">{formatUSD(available)}</span></div>
        <span className="mt-4 block text-[14px] text-[#AAB5C7]">Module</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Module">
          {PLANS.map((p) => (
              <button
              key={p.key} role="radio" aria-checked={p.key === planKey} onClick={() => selectPlan(p.key)}
              className={`rounded-[12px] border px-4 py-3 text-left transition ${p.key === planKey ? 'border-[rgba(47,214,255,0.65)] bg-[rgba(47,214,255,0.08)]' : 'border-[#2A394D] hover:border-[rgba(47,214,255,0.4)]'}`}
            >
              <div className={`text-[14px] font-bold ${p.key === planKey ? 'text-[#2FD6FF]' : 'text-white'}`}>{p.name}</div>
              <div className="mt-0.5 font-mono text-[11px] text-[#78859A]">{formatPct(p.ratePerCredit * 100)}/6h · ${p.min}–${p.max.toLocaleString()}</div>
            </button>
          ))}
        </div>
        <label htmlFor="deploy-amount" className="mt-4 block text-[14px] text-[#AAB5C7]">
          Amount (USD) · {plan.name} range {formatUSD(plan.min, { decimals: 0 })} – {formatUSD(plan.max, { decimals: 0 })}
        </label>
        <input
          id="deploy-amount"
          type="number"
          min={plan.min}
          max={plan.max}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-2 w-full rounded-[16px] border border-[#4B5C73] bg-[#151D2C] px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-[#596579] focus:border-[#2FD6FF] focus:shadow-[0_0_0_2px_rgba(47,214,255,0.12)]"
        />
        <div className="mt-6 rounded-[16px] border border-[#202A3A] bg-[#080B12] p-5 text-[14px]" aria-live="polite">
          {quoteError ? (
            <p role="alert" className="text-[13px] text-[#F06B78]">{quoteError}</p>
          ) : !quote ? (
            <p className="text-[13px] text-[#78859A]">Loading server quote…</p>
          ) : (
            <dl className="space-y-2">
              <div className="flex justify-between"><dt className="text-[#78859A]">Module</dt><dd className="font-mono text-white">{quote.planName} · {formatPct(quote.ratePerCredit * 100)}/6h</dd></div>
              <div className="flex justify-between"><dt className="text-[#78859A]">Each payout</dt><dd className="font-mono text-white">{formatUSD(quote.creditPerPayout)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#78859A]">Daily total (4×)</dt><dd className="font-mono text-white">{formatUSD(quote.dailyTotal)}</dd></div>
              <div className="flex justify-between border-t border-[#202A3A] pt-2"><dt className="font-bold text-white">Lands in total (1 day)</dt><dd className="font-mono font-bold text-[#2FD6FF]">{formatUSD(quote.totalWithPrincipal)}</dd></div>
            </dl>
          )}
        </div>
        {error && <p role="alert" className="mt-4 text-[13px] text-[#F06B78]">{error}</p>}
        <div className="mt-6">
          <AxButton onClick={() => setConfirming(true)} disabled={!quote || !hasFunds}>
            Review & Activate
          </AxButton>
        </div>
        <p className="mt-3 text-[12px] text-[#78859A]">Estimates only — no yield is guaranteed. Activation records a real deployment in your ledger.</p>
      </AxCard>
      {confirming && quote && (
        <AxCard variant="active" className="mt-4 p-6">
          <h2 className="text-[17px] font-bold text-white">Confirm deployment</h2>
          <dl className="mt-3 space-y-2 text-[14px]">
            <div className="flex justify-between"><dt className="text-[#78859A]">Amount</dt><dd className="font-mono font-bold text-white">{formatUSD(quote.amount)}</dd></div>
            <div className="flex justify-between"><dt className="text-[#78859A]">Module</dt><dd className="font-mono text-white">{quote.planName}</dd></div>
            <div className="flex justify-between"><dt className="text-[#78859A]">Each payout</dt><dd className="font-mono text-[#2FD6FF]">{formatUSD(quote.creditPerPayout)}</dd></div>
          </dl>
          <p className="mt-3 text-[12px] text-[#78859A]">Activation is recorded immediately and cannot be edited afterwards.</p>
          {error && <p role="alert" className="mt-3 text-[13px] text-[#F06B78]">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button onClick={() => setConfirming(false)} className="flex-1 rounded-[14px] border border-[#2A394D] py-3 text-[14px] font-semibold text-white hover:border-[rgba(47,214,255,0.5)]">Back</button>
            <button onClick={activate} disabled={busy} className="flex-1 rounded-[14px] bg-[#2FD6FF] py-3 text-[14px] font-bold text-[#06121A] disabled:opacity-60 hover:brightness-110">
              {busy ? 'Activating…' : 'Activate Protocol'}
            </button>
          </div>
        </AxCard>
      )}
    </div>
  );
}
