// Lower continuation/selection panel of the Plans view: selected-plan
// summary, amount input, server-authoritative quote, review + activate.
// Same real flow as before (quote API + createDeployment server action);
// only the presentation changed. With no selection it stays informational.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxButton } from '@/components/ax/controls';
import { examplePlanAmount, formatUSD, getPlan, type PlanKey, type PlanQuote } from '@/lib/plans';
import { createDeployment } from '@/lib/actions';
import { ModuleIcon, rangeLabel } from '@/components/invest/PlanCards';

export function InvestPanel({
  selected,
  available,
  hasFunds,
}: {
  selected: PlanKey | null;
  available: number;
  hasFunds: boolean;
}) {
  const router = useRouter();
  const plan = selected ? getPlan(selected) : null;
  const [amount, setAmount] = useState<number>(1000);
  const [quote, setQuote] = useState<PlanQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the amount into the newly selected plan's range.
  useEffect(() => {
    if (!plan) return;
    setAmount((a) => {
      const base = Number.isFinite(a) && a > 0 ? a : examplePlanAmount(plan);
      return Math.min(Math.max(base, plan.min), plan.max);
    });
    setConfirming(false);
    setError(null);
  }, [plan?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!plan) return;
    let cancelled = false;
    setQuoteError(null);
    setQuote(null);
    fetch(`/api/deployments/quote?amount=${amount}&plan=${plan.key}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.message || 'Quote failed.');
        if (!cancelled) setQuote(j.quote as PlanQuote);
      })
      .catch((e: unknown) => {
        if (!cancelled) setQuoteError(e instanceof Error ? e.message : 'Could not load the server quote.');
      });
    return () => {
      cancelled = true;
    };
  }, [amount, plan?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const activate = async () => {
    if (!plan) return;
    setBusy(true);
    setError(null);
    const res = await createDeployment({ amount, plan: plan.key });
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
    <div id="invest-panel" aria-live="polite" className="mt-4 scroll-mt-24 rounded-2xl border border-[#202A3A] bg-[#0A0E15] p-5">
      {!plan ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span aria-hidden="true" className="flex items-end gap-1">
            <span className="h-2 w-1.5 rounded-full bg-[rgba(47,214,255,0.35)]" />
            <span className="h-3.5 w-1.5 rounded-full bg-[rgba(47,214,255,0.6)]" />
            <span className="h-5 w-1.5 rounded-full bg-[#2FD6FF] shadow-[0_0_10px_rgba(47,214,255,0.6)]" />
          </span>
          <p className="mt-3 text-[14px] text-[#78859A]">Choose a plan above to continue.</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3">
            <ModuleIcon index={plan.key === 'essential' ? 0 : plan.key === 'premium' ? 1 : 2} />
            <div>
              <div className="text-[16px] font-bold text-white">{plan.name}</div>
              <div className="font-mono text-[12px] text-[#2FD6FF]">{rangeLabel(plan)}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[12px] text-[#78859A]">Available</div>
              <div className="font-mono text-[14px] font-bold text-white">{formatUSD(available)}</div>
            </div>
          </div>

          {!hasFunds ? (
            <div className="mt-4 rounded-[14px] border border-[rgba(242,191,74,0.4)] bg-[rgba(242,191,74,0.06)] p-5 text-center">
              <div className="font-bold text-white">Available balance is {formatUSD(0)}</div>
              <p className="mx-auto mt-1 max-w-sm text-[14px] text-[#AAB5C7]">Deployments draw from deposited funds. Deposit first, then return here to activate.</p>
              <Link href="/app/deposit" className="mt-4 inline-flex min-h-[48px] items-center rounded-[14px] bg-[#2FD6FF] px-6 text-[14px] font-bold text-[#06121A] hover:brightness-110">Deposit funds</Link>
            </div>
          ) : (
            <>
              <label htmlFor="invest-amount" className="mb-2 mt-4 block text-[13px] text-[#AAB5C7]">
                Amount (USD) · {plan.name} range {formatUSD(plan.min, { decimals: 0 })} – {formatUSD(plan.max, { decimals: 0 })}
              </label>
              <input
                id="invest-amount"
                type="number"
                min={plan.min}
                max={plan.max}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-[14px] border border-[#4B5C73] bg-[#151D2C] px-4 py-3.5 font-mono text-[15px] text-white outline-none transition placeholder:text-[#596579] focus:border-[#2FD6FF]"
              />
              <div className="mt-4 rounded-[14px] border border-[#202A3A] bg-[#080B12] p-4 text-[14px]">
                {quoteError ? (
                  <p role="alert" className="text-[13px] text-[#F06B78]">{quoteError}</p>
                ) : !quote ? (
                  <p className="text-[13px] text-[#78859A]">Loading server quote…</p>
                ) : (
                  <dl className="space-y-2">
                    <div className="flex justify-between gap-3"><dt className="text-[#78859A]">Each payout</dt><dd className="font-mono text-white">{formatUSD(quote.creditPerPayout)}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-[#78859A]">Daily total (4×)</dt><dd className="font-mono text-white">{formatUSD(quote.dailyTotal)}</dd></div>
                    <div className="flex justify-between gap-3 border-t border-[#202A3A] pt-2"><dt className="font-bold text-white">Lands in total (1 day)</dt><dd className="font-mono font-bold text-[#2FD6FF]">{formatUSD(quote.totalWithPrincipal)}</dd></div>
                  </dl>
                )}
              </div>
              {error && !confirming && <p role="alert" className="mt-3 text-[13px] text-[#F06B78]">{error}</p>}
              {!confirming ? (
                <div className="mt-4">
                  <AxButton onClick={() => setConfirming(true)} disabled={!quote || !hasFunds}>
                    Review & Activate
                  </AxButton>
                </div>
              ) : (
                quote && (
                  <div className="mt-4 rounded-[14px] border border-[rgba(47,214,255,0.35)] bg-[rgba(47,214,255,0.04)] p-4">
                    <div className="text-[15px] font-bold text-white">Confirm deployment</div>
                    <dl className="mt-2 space-y-1.5 text-[14px]">
                      <div className="flex justify-between gap-3"><dt className="text-[#78859A]">Amount</dt><dd className="font-mono font-bold text-white">{formatUSD(quote.amount)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-[#78859A]">Module</dt><dd className="font-mono text-white">{quote.planName}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-[#78859A]">Each payout</dt><dd className="font-mono text-[#2FD6FF]">{formatUSD(quote.creditPerPayout)}</dd></div>
                    </dl>
                    <p className="mt-2 text-[12px] text-[#78859A]">Activation is recorded immediately and cannot be edited afterwards.</p>
                    {error && <p role="alert" className="mt-2 text-[13px] text-[#F06B78]">{error}</p>}
                    <div className="mt-4 flex gap-3">
                      <button type="button" onClick={() => setConfirming(false)} className="flex min-h-[52px] flex-1 items-center justify-center rounded-[14px] border border-[#2A394D] text-[14px] font-semibold text-white transition hover:border-[rgba(47,214,255,0.5)]">
                        Back
                      </button>
                      <button type="button" onClick={activate} disabled={busy} className="flex min-h-[52px] flex-1 items-center justify-center rounded-[14px] bg-[#2FD6FF] text-[14px] font-bold text-[#06121A] transition hover:brightness-110 disabled:opacity-60">
                        {busy ? 'Activating…' : 'Activate Protocol'}
                      </button>
                    </div>
                  </div>
                )
              )}
              <p className="mt-3 text-[12px] text-[#78859A]">Estimates only — no yield is guaranteed. Activation records a real deployment in your ledger.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
