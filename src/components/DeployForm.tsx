'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/data';
import { Modal } from '@/components/ui';
import { PROTOCOL_CONFIG } from '@/lib/config';
import { formatUSD, formatPct, type CalculatorResult } from '@/lib/finance';
import { createDeployment } from '@/lib/actions';

export function DeployForm({ available, hasFunds }: { available: number; hasFunds: boolean }) {
  const router = useRouter();
  const [amount, setAmount] = useState(1000);
  const [term, setTerm] = useState(30);
  const [quote, setQuote] = useState<CalculatorResult | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setQuoteError(null);
    fetch(`/api/deployments/quote?amount=${amount}&termDays=${term}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('quote failed');
        const j = await r.json();
        if (!cancelled) setQuote(j.quote as CalculatorResult);
      })
      .catch(() => {
        if (!cancelled) setQuoteError('Could not load the server quote. Check your connection and try again.');
      });
    return () => {
      cancelled = true;
    };
  }, [amount, term]);

  const activate = async () => {
    setBusy(true);
    setError(null);
    const res = await createDeployment({ amount, termDays: term });
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
      <PageHeader title="Deploy Capital" sub="Activate a deployment from your available balance. Quotes are computed server-side." />
      {!hasFunds && (
        <div className="glass mt-6 rounded-2xl border-amberx/30 p-6 text-center">
          <div className="font-bold">Available balance is $0.00</div>
          <p className="mx-auto mt-1 max-w-sm text-sm text-fog">Deployments draw from deposited funds. Deposit first, then return here to activate.</p>
          <Link href="/app/deposit" className="mt-4 inline-block rounded-xl bg-pulse px-6 py-2.5 text-sm font-bold text-black hover:brightness-110">Deposit funds</Link>
        </div>
      )}
      <div className="glass mt-6 rounded-2xl p-6 sm:p-8">
        <div className="text-sm text-fog">Available Balance <span className="font-mono font-bold text-white">{formatUSD(available)}</span></div>
        <label htmlFor="deploy-amount" className="mt-4 block text-xs text-fog">Amount (USD)</label>
        <input
          id="deploy-amount"
          type="number"
          min={PROTOCOL_CONFIG.minDeployment}
          max={PROTOCOL_CONFIG.maxDeployment}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse"
        />
        <span className="mt-4 block text-xs text-fog">Term</span>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Term">
          {PROTOCOL_CONFIG.termOptions.map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={term === t}
              onClick={() => setTerm(t)}
              className={`rounded-xl border px-4 py-2 text-sm ${term === t ? 'border-pulse/60 bg-pulse/10 font-bold text-pulse' : 'border-line hover:border-pulse/50'}`}
            >
              {t} days
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-line bg-void/60 p-5 text-sm" aria-live="polite">
          {quoteError ? (
            <p role="alert" className="text-xs text-danger">{quoteError}</p>
          ) : !quote ? (
            <p className="text-xs text-fog">Loading server quote…</p>
          ) : (
            <dl className="space-y-2">
              <div className="flex justify-between"><dt className="text-fog">Daily rate</dt><dd className="font-mono">{formatPct(quote.dailyRate * 100)}</dd></div>
              <div className="flex justify-between"><dt className="text-fog">Gross profit ({quote.termDays}d)</dt><dd className="font-mono">{formatUSD(quote.grossProfit)}</dd></div>
              <div className="flex justify-between"><dt className="text-fog">Protocol fee ({(PROTOCOL_CONFIG.performanceFeeRate * 100).toFixed(0)}%)</dt><dd className="font-mono">−{formatUSD(quote.protocolFee)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2"><dt className="font-bold">Net profit</dt><dd className="font-mono font-bold text-pulse">+{formatUSD(quote.netProfit)}</dd></div>
            </dl>
          )}
        </div>
        {error && <p role="alert" className="mt-4 text-xs text-danger">{error}</p>}
        <button
          onClick={() => setConfirming(true)}
          disabled={!quote || !hasFunds}
          className="mt-6 w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black disabled:opacity-50 sm:w-auto sm:px-8 hover:brightness-110"
        >
          Review & Activate
        </button>
        <p className="mt-3 text-xs text-fog">Estimates only — no yield is guaranteed. Activation records a real deployment in your ledger.</p>
      </div>
      {confirming && quote && (
        <Modal title="Confirm deployment" onClose={() => setConfirming(false)}>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-fog">Amount</dt><dd className="font-mono font-bold">{formatUSD(quote.amount)}</dd></div>
            <div className="flex justify-between"><dt className="text-fog">Term</dt><dd className="font-mono">{quote.termDays} days</dd></div>
            <div className="flex justify-between"><dt className="text-fog">Net profit (est.)</dt><dd className="font-mono text-pulse">+{formatUSD(quote.netProfit)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-fog">Activation is recorded immediately and cannot be edited afterwards.</p>
          {error && <p role="alert" className="mt-3 text-xs text-danger">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button onClick={() => setConfirming(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm hover:border-pulse/50">Back</button>
            <button onClick={activate} disabled={busy} className="flex-1 rounded-xl bg-pulse py-2.5 text-sm font-bold text-black disabled:opacity-60">
              {busy ? 'Activating…' : 'Activate Protocol'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
