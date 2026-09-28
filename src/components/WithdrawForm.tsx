'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { requestWithdrawal } from '@/lib/actions';

const input = 'mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse';

export function WithdrawForm({ available, wallets }: { available: number; wallets: { id: string; asset: string; network: string; address: string }[] }) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState(wallets[0]?.address ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    const res = await requestWithdrawal({ amount: Number(amount), address });
    setBusy(false);
    setMessage({ ok: res.ok, text: res.message });
    if (res.ok) setAmount('');
  };

  return (
    <div>
      <PageHeader title="Withdraw" sub="Withdrawals draw from available balance only and are processed in the daily window." />
      <div className="glass mt-6 max-w-2xl rounded-2xl p-6 sm:p-8">
        <div className="text-sm text-fog">Available Balance <span className="font-mono font-bold text-white">{formatUSD(available)}</span></div>
        <label htmlFor="wd-amount" className="mt-4 block text-xs text-fog">Amount (USDT)</label>
        <input id="wd-amount" type="number" min={1} placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={input} />
        <label htmlFor="wd-address" className="mt-4 block text-xs text-fog">Destination address (TRC20)</label>
        {wallets.length > 0 ? (
          <select id="wd-address" value={address} onChange={(e) => setAddress(e.target.value)} className={input}>
            {wallets.map((w) => (
              <option key={w.id} value={w.address}>{w.asset}/{w.network} · {w.address.slice(0, 12)}…</option>
            ))}
          </select>
        ) : (
          <input id="wd-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter destination address" className={`${input} font-mono`} />
        )}
        {wallets.length === 0 && (
          <p className="mt-2 text-xs text-fog">Tip: <Link href="/app/wallets" className="text-pulse">save an address</Link> to reuse it here.</p>
        )}
        <div className="mt-4 space-y-1 text-xs text-fog">
          <div>Network fee: estimated at broadcast</div>
          <div>Platform fee: $0.00</div>
        </div>
        {message && <p role={message.ok ? 'status' : 'alert'} className={`mt-4 text-xs ${message.ok ? 'text-pulse' : 'text-danger'}`}>{message.text}</p>}
        <button onClick={submit} disabled={busy || available <= 0} className="mt-6 rounded-xl bg-pulse px-8 py-3 text-sm font-bold text-black disabled:opacity-50 hover:brightness-110">
          {busy ? 'Submitting…' : 'Confirm Withdrawal'}
        </button>
        {available <= 0 && <p className="mt-3 text-xs text-fog">Nothing available to withdraw. <Link href="/app/deposit" className="text-pulse">Deposit funds</Link> first.</p>}
      </div>
    </div>
  );
}
