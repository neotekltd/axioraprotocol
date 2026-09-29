'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/data';
import { AxButton, AxInput, FieldError, FieldSuccess } from '@/components/ax/controls';
import { formatUSD } from '@/lib/finance';
import { requestWithdrawal } from '@/lib/actions';

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

  const selectCls = 'mt-2 w-full rounded-[16px] border border-[#4B5C73] bg-[#151D2C] px-4 py-3.5 text-[15px] text-white outline-none focus:border-[#2FD6FF]';

  return (
    <div>
      <PageHeader title="Withdraw" sub="Withdrawals draw from available balance only. Requests are recorded with a balance hold; on-chain broadcast activates with the execution layer." />
      <div className="mt-6 max-w-2xl rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-6 sm:p-7">
        <div className="text-[14px] text-[#AAB5C7]">Available Balance <span className="font-mono font-bold text-white">{formatUSD(available)}</span></div>
        <label htmlFor="wd-amount" className="mb-2 mt-4 block text-[15px] text-[#AAB5C7]">Amount (USDT)</label>
        <AxInput id="wd-amount" type="number" min={1} placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
        <label htmlFor="wd-address" className="mb-2 mt-5 block text-[15px] text-[#AAB5C7]">Destination address (TRC20)</label>
        {wallets.length > 0 ? (
          <select id="wd-address" value={address} onChange={(e) => setAddress(e.target.value)} className={selectCls}>
            {wallets.map((w) => (
              <option key={w.id} value={w.address}>{w.asset}/{w.network} · {w.address.slice(0, 12)}…</option>
            ))}
          </select>
        ) : (
          <AxInput id="wd-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter destination address" className="font-mono" autoComplete="off" />
        )}
        {wallets.length === 0 && (
          <p className="mt-2 text-[13px] text-[#78859A]">Tip: <Link href="/app/wallets" className="text-[#2FD6FF]">save an address</Link> to reuse it here.</p>
        )}
        <div className="mt-4 space-y-1 text-[13px] text-[#78859A]">
          <div>Network fee: estimated at broadcast</div>
          <div>Platform fee: $0.00</div>
        </div>
        {message && (message.ok
          ? <FieldSuccess message={message.text} />
          : <div className="mt-3"><FieldError message={message.text} /></div>)}
        <div className="mt-6">
          <AxButton onClick={submit} disabled={busy || available <= 0}>
            {busy ? 'Submitting…' : 'Confirm Withdrawal'}
          </AxButton>
        </div>
        {available <= 0 && <p className="mt-3 text-[13px] text-[#78859A]">Nothing available to withdraw. <Link href="/app/deposit" className="text-[#2FD6FF]">Deposit funds</Link> first.</p>}
      </div>
    </div>
  );
}
