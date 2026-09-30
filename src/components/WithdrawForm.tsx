'use client';

// Withdraw flow in the authenticated wallet language: You withdraw
// (available balance + big amount) → You receive (coin + network +
// destination state) → Rate/Fee/Limit/Sent → address CTA or confirm.
// Saved addresses persist via wallets; adding one uses the same save
// action as the wallets page. All validation stays server-side.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/data';
import { AxButton, AxInput, FieldError, FieldSuccess } from '@/components/ax/controls';
import { formatUSD } from '@/lib/finance';
import { addWallet, requestWithdrawal } from '@/lib/actions';
import {
  BottomSheet,
  DividerArrow,
  FlowCard,
  FlowLabel,
  SummaryRows,
  TechnicalWarning,
  WalletTabs,
} from '@/components/ax/wallet';

export function WithdrawForm({ available, wallets }: { available: number; wallets: { id: string; asset: string; network: string; address: string }[] }) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState(wallets[0]?.address ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  const num = Number(amount);
  const amountOk = Number.isFinite(num) && num > 0;

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    const res = await requestWithdrawal({ amount: num, address });
    setBusy(false);
    setMessage({ ok: res.ok, text: res.message });
    if (res.ok) {
      setAmount('');
      router.refresh();
    }
  };

  const saveAddress = async () => {
    setSaving(true);
    setSaveError(null);
    const res = await addWallet({ asset: 'USDT', network: 'TRC20', address: newAddress.trim(), label: newLabel.trim() || undefined });
    setSaving(false);
    if (!res.ok) {
      setSaveError(res.message);
      return;
    }
    setAddress(newAddress.trim());
    setNewAddress('');
    setNewLabel('');
    setSheetOpen(false);
    router.refresh();
  };

  const selected = wallets.find((w) => w.address === address);

  return (
    <div>
      <PageHeader title="Withdraw" sub="Withdrawals draw from available balance only." />
      <div className="mt-6">
        <WalletTabs active="withdraw" />
      </div>
      <FlowCard className="mt-4">
        <FlowLabel right={`Available ${formatUSD(available)}`}>You withdraw</FlowLabel>
        <div className="mt-2 flex items-center gap-1">
          <span aria-hidden="true" className="font-mono text-[32px] font-bold text-[#78859A]">$</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            type="number"
            min={0}
            autoComplete="off"
            aria-label="Withdrawal amount in USDT"
            placeholder="0"
            className="w-full min-w-0 bg-transparent font-mono text-[40px] font-bold leading-none tracking-tight text-white outline-none placeholder:text-[#2A394D]"
          />
        </div>
      </FlowCard>
      <DividerArrow />
      <FlowCard>
        <FlowLabel>You receive</FlowLabel>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-mono text-[28px] font-bold leading-none text-white">
            {amountOk ? num : 0} <span className="text-[16px] font-semibold text-[#AAB5C7]">USDT</span>
          </span>
          <span className="shrink-0 rounded-full border border-[#2A394D] bg-[#151B27] px-3.5 py-2 text-[14px] font-bold text-white">
            USDT
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[13px] text-[#AAB5C7]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#2FD6FF]" />
          on TRON (TRC-20)
        </div>
        <div className="mt-4">
          {wallets.length > 0 ? (
            <div>
              <label htmlFor="wd-address" className="mb-2 block text-[13px] text-[#78859A]">Where it goes</label>
              <select
                id="wd-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-[14px] border border-[#2A394D] bg-[#151B27] px-4 py-3.5 font-mono text-[14px] text-white outline-none focus:border-[#2FD6FF]"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.address}>{w.asset}/{w.network} · {w.address.slice(0, 12)}…</option>
                ))}
              </select>
              {selected && (
                <p className="mt-2 break-all font-mono text-[12px] text-[#78859A]">{selected.address}</p>
              )}
            </div>
          ) : (
            <TechnicalWarning
              title="Where it goes"
              body="No USDT address saved yet"
              action={
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="shrink-0 rounded-[12px] border border-[rgba(242,191,74,0.4)] px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-[rgba(242,191,74,0.1)]"
                >
                  Add
                </button>
              }
            />
          )}
        </div>
      </FlowCard>
      <FlowCard className="mt-4">
        <SummaryRows
          rows={[
            { label: 'Rate', value: '1 USDT = $1.00', tone: 'white' },
            { label: 'Fee', value: 'None', tone: 'white' },
            { label: 'Limit', value: `Available ${formatUSD(available)}`, tone: 'white' },
            { label: 'Sent', value: 'Recorded as pending', tone: 'white' },
          ]}
        />
        {wallets.length === 0 ? (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#2FD6FF] text-[15px] font-bold text-[#06121A] shadow-[0_0_28px_rgba(47,214,255,0.25)] transition hover:brightness-110 active:scale-[0.99]"
          >
            Add a USDT address <span aria-hidden="true">→</span>
          </button>
        ) : (
          <div className="mt-4">
            <AxButton onClick={submit} disabled={busy || available <= 0 || !amountOk}>
              {busy ? 'Submitting…' : 'Confirm Withdrawal'}
            </AxButton>
          </div>
        )}
        {message && (message.ok
          ? <div className="mt-3"><FieldSuccess message={message.text} /></div>
          : <div className="mt-3"><FieldError message={message.text} /></div>)}
        {available <= 0 && (
          <p className="mt-3 text-[13px] text-[#78859A]">
            Nothing available to withdraw. <Link href="/app/deposit" className="font-semibold text-[#2FD6FF]">Deposit funds</Link> first.
          </p>
        )}
      </FlowCard>
      <p className="mt-4 text-center text-[13px] text-[#78859A]">
        Where is my withdrawal? <Link href="/app/transactions" className="font-semibold text-[#2FD6FF] hover:brightness-110">See your withdrawals</Link>
      </p>
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        labelledBy="Save a USDT address"
        title="USDT · TRC-20 address"
      >
        <p className="text-[14px] text-[#AAB5C7]">Save where your coins are sent</p>
        <label htmlFor="sheet-address" className="mb-2 mt-4 block text-[14px] font-semibold text-white">Address</label>
        <AxInput
          id="sheet-address"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="T…"
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
        />
        <label htmlFor="sheet-label" className="mb-2 mt-4 block text-[14px] font-semibold text-white">
          Label <span className="font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-[#596579]">optional</span>
        </label>
        <AxInput id="sheet-label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Main wallet" autoComplete="off" maxLength={60} />
        <div className="mt-4">
          <TechnicalWarning
            title="This must be an address on the TRC-20 network."
            body="Coins sent to the wrong network cannot be recovered."
          />
        </div>
        <FieldError message={saveError} />
        <div className="mt-5 space-y-2.5">
          <AxButton onClick={saveAddress} disabled={saving || newAddress.trim().length < 8}>
            {saving ? 'Saving…' : 'Save address'}
          </AxButton>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="flex min-h-[52px] w-full items-center justify-center rounded-[14px] border border-[#2A394D] bg-[#111722] text-[14px] font-bold text-white transition hover:border-[rgba(47,214,255,0.5)]"
          >
            Cancel
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
