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
import { useT } from '@/components/LanguageProvider';
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
  const t = useT();
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
      <PageHeader title={t.withdraw.title} sub={t.wd.fromAvail} />
      <div className="mt-6">
        <WalletTabs active="withdraw" />
      </div>
      <FlowCard className="mt-4">
        <FlowLabel right={t.wd.availX.replace('{x}', formatUSD(available))}>{t.wd.youWithdraw}</FlowLabel>
        <div className="mt-2 flex items-center gap-1">
          <span aria-hidden="true" className="font-mono text-[32px] font-bold text-[#78859A]">$</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            type="number"
            min={0}
            autoComplete="off"
            aria-label={t.wd.wdAmountAria}
            placeholder="0"
            dir="ltr"
            className="w-full min-w-0 bg-transparent font-mono text-[40px] font-bold leading-none tracking-tight text-white outline-none placeholder:text-[#2A394D]"
          />
        </div>
      </FlowCard>
      <DividerArrow />
      <FlowCard>
        <FlowLabel>{t.wd.youReceive}</FlowLabel>
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
          {t.wd.onTron}
        </div>
        <div className="mt-4">
          {wallets.length > 0 ? (
            <div>
              <label htmlFor="wd-address" className="mb-2 block text-[13px] text-[#78859A]">{t.wd.whereGoes}</label>
              <select
                id="wd-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                dir="ltr"
                className="w-full rounded-[14px] border border-[#2A394D] bg-[#151B27] px-4 py-3.5 font-mono text-[14px] text-white outline-none focus:border-[#2FD6FF]"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.address}>{w.asset}/{w.network} · {w.address.slice(0, 12)}…</option>
                ))}
              </select>
              {selected && (
                <p dir="ltr" className="mt-2 break-all font-mono text-[12px] text-[#78859A]">{selected.address}</p>
              )}
            </div>
          ) : (
            <TechnicalWarning
              title={t.wd.whereGoes}
              body={t.wd.noAddr}
              action={
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="shrink-0 rounded-[12px] border border-[rgba(242,191,74,0.4)] px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-[rgba(242,191,74,0.1)]"
                >
                  {t.wd.addBtn}
                </button>
              }
            />
          )}
        </div>
      </FlowCard>
      <FlowCard className="mt-4">
        <SummaryRows
          rows={[
            { label: t.dep.rate, value: '1 USDT = $1.00', tone: 'white' },
            { label: t.dep.fee, value: t.dep.none, tone: 'white' },
            { label: t.wd.limit, value: t.wd.availX.replace('{x}', formatUSD(available)), tone: 'white' },
            { label: t.wd.sent, value: t.wd.sentVal, tone: 'white' },
          ]}
        />
        {wallets.length === 0 ? (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#2FD6FF] text-[15px] font-bold text-[#06121A] shadow-[0_0_28px_rgba(47,214,255,0.25)] transition hover:brightness-110 active:scale-[0.99]"
          >
            {t.wd.addAddr} <span aria-hidden="true">→</span>
          </button>
        ) : (
          <div className="mt-4">
            <AxButton onClick={submit} disabled={busy || available <= 0 || !amountOk}>
              {busy ? t.withdraw.submitting : t.wd.confirmWd}
            </AxButton>
          </div>
        )}
        {message && (message.ok
          ? <div className="mt-3"><FieldSuccess message={message.text} /></div>
          : <div className="mt-3"><FieldError message={message.text} /></div>)}
        {available <= 0 && (
          <p className="mt-3 text-[13px] text-[#78859A]">
            {t.wd.nothingAvail} <Link href="/app/deposit" className="font-semibold text-[#2FD6FF]">{t.wd.depositFirst}</Link>
          </p>
        )}
      </FlowCard>
      <p className="mt-4 text-center text-[13px] text-[#78859A]">
        {t.wd.whereIs} <Link href="/app/transactions" className="font-semibold text-[#2FD6FF] hover:brightness-110">{t.wd.seeWds}</Link>
      </p>
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        labelledBy={t.wd.sheetTitle}
        title={t.wd.sheetH}
      >
        <p className="text-[14px] text-[#AAB5C7]">{t.wd.sheetSub}</p>
        <label htmlFor="sheet-address" className="mb-2 mt-4 block text-[14px] font-semibold text-white">{t.wd.addrLbl}</label>
        <AxInput
          id="sheet-address"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="T…"
          autoComplete="off"
          spellCheck={false}
          dir="ltr"
          className="font-mono"
        />
        <label htmlFor="sheet-label" className="mb-2 mt-4 block text-[14px] font-semibold text-white">
          {t.wd.labelLbl} <span className="font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-[#596579]">{t.common.optional}</span>
        </label>
        <AxInput id="sheet-label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder={t.wd.labelPh} autoComplete="off" maxLength={60} />
        <div className="mt-4">
          <TechnicalWarning
            title={t.wd.mustTrc}
            body={t.wd.wrongNet2}
          />
        </div>
        <FieldError message={saveError} />
        <div className="mt-5 space-y-2.5">
          <AxButton onClick={saveAddress} disabled={saving || newAddress.trim().length < 8}>
            {saving ? t.wd.saving : t.wd.saveAddr}
          </AxButton>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="flex min-h-[52px] w-full items-center justify-center rounded-[14px] border border-[#2A394D] bg-[#111722] text-[14px] font-bold text-white transition hover:border-[rgba(47,214,255,0.5)]"
          >
            {t.common.cancel}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
