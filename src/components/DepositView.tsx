'use client';

// Deposit flow in the authenticated wallet language: You send (amount +
// coin/network + quick chips) → You get → Rate/Fee/Arrives → Get deposit
// address → confirmation (Send X, Waiting pill, QR, address, copy amount,
// dynamic network warning, 3-stage tracker). All data comes from the
// central deposit config via props — no literals, no invented limits.

import { useState } from 'react';import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronDown, QrCode, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/data';
import { useT } from '@/components/LanguageProvider';
import { formatUSD } from '@/lib/plans';
import { submitDepositTx } from '@/lib/actions';
import { ProviderDeposit } from '@/components/ProviderDeposit';
import type { WalletTxn } from '@/lib/queries';
import type { DepositMethod } from '@/lib/deposits';
import {
  BottomSheet,
  CopyButton,
  DividerArrow,
  FlowCard,
  FlowLabel,
  QuickChips,
  StatusPill,
  SummaryRows,
  TechnicalWarning,
  WalletTabs,
} from '@/components/ax/wallet';

const PRESET_AMOUNTS = [50, 100, 500];
const MIN_DEPOSIT = 10;

function MethodIcon({ m, size = 40 }: { m: DepositMethod; size?: number }) {
  const t = useT();
  const [failed, setFailed] = useState(false);
  if (m.icon && !failed) {
    return (
      <Image
        src={m.icon}
        alt={t.dep.logoAlt.replace('{name}', m.asset === 'USDT' ? 'Tether' : m.assetName)}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full border border-[#2A394D] bg-[#151B27] font-mono font-bold text-[#2FD6FF]"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {m.asset.slice(0, 1)}
    </span>
  );
}

function Tracker({ hasCompleted }: { hasCompleted: boolean }) {
  const t = useT();
  const stages: [string, 'done' | 'current' | 'todo'][] = [
    [t.dep.tr1, 'done'],
    [t.dep.tr2, hasCompleted ? 'done' : 'current'],
    [t.dep.tr3, hasCompleted ? 'done' : 'todo'],
  ];
  return (
    <ol className="flex items-start" aria-label={t.dep.trackerAria}>
      {stages.map(([label, state], i) => (
        <li key={label} className="relative flex flex-1 flex-col items-center text-center">
          {i > 0 && (
            <span
              aria-hidden="true"
              className={`absolute right-1/2 top-[13px] h-px w-full ${state === 'todo' ? 'bg-[#2A394D]' : 'bg-[#35D98B]/60'}`}
            />
          )}
          <span
            aria-hidden="true"
            className={`z-10 grid h-7 w-7 place-items-center rounded-full border text-[12px] ${
              state === 'done'
                ? 'border-[rgba(53,217,139,0.5)] bg-[rgba(53,217,139,0.12)] text-[#35D98B]'
                : state === 'current'
                  ? 'border-[rgba(47,214,255,0.6)] bg-[rgba(47,214,255,0.1)] text-[#2FD6FF] shadow-[0_0_14px_rgba(47,214,255,0.35)]'
                  : 'border-[#2A394D] bg-[#111722] text-[#596579]'
            }`}
          >
            {state === 'done' ? <Check size={13} /> : state === 'current' ? <span className="h-2 w-2 animate-pulse rounded-full bg-current" /> : null}
          </span>
          <span className={`mt-2 text-[12px] font-semibold leading-tight ${state === 'todo' ? 'text-[#596579]' : 'text-white'}`}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export function DepositView({ methods, deposits, qr, providerAssets }: {
  methods: DepositMethod[];
  deposits: WalletTxn[];
  qr: Record<string, string>;
  providerAssets?: string[];
}) {
  const [idx, setIdx] = useState(0);
  const [amount, setAmount] = useState('100');
  const [chip, setChip] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [coinOpen, setCoinOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txBusy, setTxBusy] = useState(false);
  const [txMsg, setTxMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [preferManual, setPreferManual] = useState(false);
  const m = methods[idx];
  const providerSupported = !!m && (providerAssets ?? []).includes(m.id);
  const showAuto = providerSupported && !preferManual;

  const t = useT();
  if (!m) {
    return (
      <div className="ax-enter">
        <PageHeader title={t.dep.title} sub={t.dep.sub} />
        <div className="mt-6">
          <WalletTabs active="deposit" />
        </div>
        <FlowCard className="mt-4">
          <div className="p-2">
            <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">{t.dep.statusLbl}</div>
            <div className="mt-2 text-[17px] font-bold text-white">{t.dep.notConfigured}</div>
            <p className="mt-2 text-[14px] text-[#AAB5C7]">
              {t.dep.notConfiguredBody}
            </p>
            <Link href="/app/support" className="mt-4 inline-block rounded-[14px] border border-[#2A394D] px-5 py-2.5 text-[14px] font-semibold text-white hover:border-[rgba(47,214,255,0.5)]">
              {t.dep.askSupport}
            </Link>
          </div>
        </FlowCard>
      </div>
    );
  }

  const num = Number(amount);
  // Floor comes from the method record when the backend provides one,
  // otherwise the workspace minimum. Client-side only gates the CTA —
  // the server action re-validates authoritatively.
  const minDep = m.minimumDeposit ?? MIN_DEPOSIT;
  const valid = Number.isFinite(num) && num >= minDep;
  const recent = deposits.filter((t) => t.asset === m.asset);
  const hasCompleted = recent.some((t) => t.status === 'completed');
  // Preset labels follow the SELECTED asset (never a hardcoded symbol).
  // Max fills the largest one-tap amount; it never bypasses validation.
  const chipOptions = [...PRESET_AMOUNTS.map((v) => `${v} ${m.asset}`), t.dep.maxChip];
  const activeChip = chip ?? (PRESET_AMOUNTS.some((v) => String(v) === amount.trim()) ? `${amount.trim()} ${m.asset}` : null);
  const pickChip = (c: string) => {
    if (c === t.dep.maxChip) {
      setAmount(String(PRESET_AMOUNTS[PRESET_AMOUNTS.length - 1]));
      setChip(t.dep.maxChip);
      return;
    }
    setChip(c);
    setAmount(c.split(' ')[0]);
  };
  const selectMethod = (i: number) => {
    setIdx(i);
    setChip(null);
    setCoinOpen(false);
    setPreferManual(false);
  };

  const submitTx = async () => {
    setTxBusy(true);
    setTxMsg(null);
    const res = await submitDepositTx({ assetId: m.id, amount: num, txHash });
    setTxBusy(false);
    setTxMsg({ ok: res.ok, text: res.message });
    if (res.ok) setTxHash('');
  };

  if (confirmed && valid) {
    return (
      <div className="ax-enter">
        <button
          type="button"
          onClick={() => setConfirmed(false)}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] text-[#AAB5C7] transition hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" /> {t.dep.changeAmount}
        </button>
        {providerSupported && (
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-[14px] border border-[#202A3A] bg-[#0A0E16] p-1.5" role="tablist" aria-label={t.dep.tablist}>
            <button
              type="button" role="tab" aria-selected={showAuto} onClick={() => setPreferManual(false)}
              className={`flex min-h-[44px] items-center justify-center rounded-[10px] text-[13px] font-bold transition ${showAuto ? 'bg-[#1A2334] text-white' : 'text-[#78859A] hover:text-white'}`}
            >
              {t.dep.tabAuto}
            </button>
            <button
              type="button" role="tab" aria-selected={!showAuto} onClick={() => setPreferManual(true)}
              className={`flex min-h-[44px] items-center justify-center rounded-[10px] text-[13px] font-bold transition ${!showAuto ? 'bg-[#1A2334] text-white' : 'text-[#78859A] hover:text-white'}`}
            >
              {t.dep.tabManual}
            </button>
          </div>
        )}
        <FlowCard className="mt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <MethodIcon m={m} size={44} />
              <div>
                <div className="text-[19px] font-bold text-white">{t.dep.sendX.replace('{n}', String(num)).replace('{asset}', m.asset)}</div>
                <div className="mt-0.5 text-[13px] text-[#78859A]">{t.dep.onNet.replace('{net}', m.network).replace('{std}', m.standard)}</div>
              </div>
            </div>
            <StatusPill tone={hasCompleted ? 'green' : 'amber'}>{hasCompleted ? t.dep.creditedSt : t.dep.waitingSt}</StatusPill>
          </div>
          {showAuto ? (
            <div className="mt-5">
              <ProviderDeposit assetId={m.id} amount={num} networkLabel={`${m.network} (${m.standard})`} />
              <div className="mt-6">
                <Tracker hasCompleted={hasCompleted} />
              </div>
              <p className="mt-4 text-center text-[13px] text-[#78859A]">
                {t.dep.autoNote}
              </p>
            </div>
          ) : (
          <>
          <button
            type="button"
            onClick={() => setQrOpen((v) => !v)}
            aria-expanded={qrOpen}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#2A394D] bg-[#111722] text-[14px] font-bold text-white transition hover:border-[rgba(47,214,255,0.5)]"
          >
            <QrCode size={17} aria-hidden="true" /> {qrOpen ? t.dep.hideQR : t.dep.showQR}
          </button>
          {qrOpen && (
            <div className="mt-3 flex flex-col items-center rounded-[14px] border border-[#2A394D] bg-white p-5">
              {qr[m.id] ? (
                <span dangerouslySetInnerHTML={{ __html: qr[m.id] }} role="img" aria-label={m.depositAddress} />
              ) : (
                <p className="text-[13px] text-[#78859A]">{t.dep.qrUnavailable}</p>
              )}
              <p className="mt-2 font-mono text-[11px] text-black/60">{t.dep.qrNote}</p>
            </div>
          )}
          <div className="mt-5 text-[14px] text-[#AAB5C7]">{t.dep.toAddress}</div>
          <div dir="ltr" className="mt-2 break-all rounded-[14px] border border-[#2A394D] bg-[#080B12] p-4 font-mono text-[15px] leading-relaxed text-white" style={{ overflowWrap: 'anywhere' }}>
            {m.depositAddress}
          </div>
          <div className="mt-3 space-y-2.5">
            <CopyButton text={m.depositAddress} label={t.dep.copyAddress} primary />
            <CopyButton text={String(num)} label={t.dep.copyN.replace('{n}', String(num))} />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[#AAB5C7]">
            {t.dep.minCredit.replace('{min}', formatUSD(minDep))}
          </p>
          <div className="mt-3">
            <TechnicalWarning
              title={t.dep.onlyNetT.replace('{asset}', m.asset).replace('{net}', m.network).replace('{std}', m.standard)}
              body={t.dep.onlyNetB}
            />
          </div>
          <div className="mt-6">
            <Tracker hasCompleted={hasCompleted} />
          </div>
          <p className="mt-4 text-center text-[13px] text-[#78859A]">
            {t.dep.manualNote}
          </p>
          <div className="mt-5 rounded-[16px] border border-[#202A3A] bg-[#0A0E16] p-4 sm:p-5">
            <div className="text-[15px] font-bold text-white">{t.dep.sentQ}</div>
            <label htmlFor="deposit-txid" className="mb-2 mt-3 block text-[13px] text-[#AAB5C7]">
              {t.wallet.txidLabel}
            </label>
            <input
              id="deposit-txid"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder={m.asset === 'USDT' && m.network !== 'TRON' ? '0x…' : t.wallet.txidPh}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              dir="ltr"
              className="w-full rounded-[12px] border border-[#2A394D] bg-[#080B12] px-4 py-3.5 font-mono text-[13px] text-white outline-none transition placeholder:text-[#596579] focus:border-[#2FD6FF]"
            />
            <p className="mt-2 text-[12px] leading-relaxed text-[#78859A]">
              {t.dep.txidHint2}
            </p>
            {txMsg && (
              <p role={txMsg.ok ? 'status' : 'alert'} className={`mt-2 text-[13px] font-semibold ${txMsg.ok ? 'text-[#35D98B]' : 'text-[#F2BF4A]'}`}>
                {txMsg.text}
              </p>
            )}
            <button
              type="button"
              onClick={() => void submitTx()}
              disabled={txBusy || txHash.trim().length < 16}
              className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-[14px] border border-[#2A394D] bg-[#111722] text-[14px] font-bold text-white transition hover:border-[rgba(47,214,255,0.55)] active:scale-[0.99] disabled:opacity-50"
            >
              {txBusy ? t.wallet.submitting : t.dep.submitTx}
            </button>
          </div>
          <SummaryRows
            rows={[
              { label: t.dep.youGet, value: `${formatUSD(num)} ${t.dep.intoWallet}`, tone: 'green' },
              { label: t.dep.dest, value: `${m.asset} · ${m.network} · ${m.standard}`, tone: 'muted' },
            ]}
          />
          <p className="mt-4 border-t border-[#202A3A] pt-4 text-center text-[13px] text-[#78859A]">
            {t.dep.noLimit}
          </p>
          </>
          )}
        </FlowCard>
        <p className="mt-4 text-center text-[13px] text-[#78859A]">
          {t.dep.notCredited} <Link href="/app/support" className="font-semibold text-[#2FD6FF] hover:brightness-110">{t.support.openTicket}</Link> {t.dep.withHash}
        </p>
      </div>
    );
  }

  return (
    <div className="ax-enter">
      <PageHeader title={t.dep.title} sub={t.dep.sub} />
      <div className="mt-6">
        <WalletTabs active="deposit" />
      </div>
      <FlowCard className="mt-4">
        <FlowLabel right={t.dep.minLbl.replace('{min}', formatUSD(minDep))}>{t.dep.youSend}</FlowLabel>
        <div className="mt-2 flex items-center justify-between gap-3">
          <input
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setChip(null); }}
            inputMode="decimal"
            autoComplete="off"
            aria-label={t.dep.amountAria}
            placeholder="0"
            dir="ltr"
            className="w-full min-w-0 bg-transparent font-mono text-[40px] font-bold leading-none tracking-tight text-white outline-none placeholder:text-[#2A394D]"
          />
          <button
            type="button"
            onClick={() => setCoinOpen(true)}
            aria-haspopup="dialog"
            className="flex shrink-0 items-center gap-2 rounded-full border border-[#2A394D] bg-[#151B27] py-2 pl-2 pr-3 transition hover:border-[rgba(47,214,255,0.5)]"
          >
            <MethodIcon m={m} size={32} />
            <span className="text-[15px] font-bold text-white">{m.asset}</span>
            <ChevronDown size={16} className="text-[#78859A]" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[13px] text-[#AAB5C7]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#2FD6FF]" />
          {t.dep.onNet.replace('{net}', m.network).replace('{std}', m.standard)}
        </div>
        <QuickChips options={chipOptions} active={activeChip} onPick={pickChip} />
        {!valid && amount.trim() !== '' && (
          <p role="alert" className="mt-2 text-[13px] text-[#F2BF4A]">{t.dep.minAlert.replace('{min}', formatUSD(minDep))}</p>
        )}
      </FlowCard>
      <DividerArrow />
      <FlowCard>
        <FlowLabel>{t.dep.youGet}</FlowLabel>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-mono text-[32px] font-bold leading-none tracking-tight text-[#35D98B]">
            {valid ? formatUSD(num) : '$0.00'}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#AAB5C7]">
            <Wallet size={15} aria-hidden="true" /> {t.dep.depositWalletLbl}
          </span>
        </div>
      </FlowCard>
      <FlowCard className="mt-4">
        <SummaryRows
          rows={[
            { label: t.dep.rate, value: `1 ${m.asset} = $1.00`, tone: 'white' },
            { label: t.dep.fee, value: t.dep.none, tone: 'white' },
            { label: t.dep.arrives, value: t.dep.arrivesV, tone: 'white' },
          ]}
        />
        <button
          type="button"
          onClick={() => setConfirmed(true)}
          disabled={!valid}
          className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#2FD6FF] text-[15px] font-bold text-[#06121A] shadow-[0_0_28px_rgba(47,214,255,0.25)] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
        >
          {t.dep.getAddr} <span aria-hidden="true">→</span>
        </button>
        {m.feeNote && <p className="mt-3 text-[12px] text-[#78859A]">{m.feeNote}</p>}
      </FlowCard>
      <p className="mt-4 text-center text-[13px] text-[#78859A]">
        {t.dep.sentNotCredited} <Link href="/app/support" className="font-semibold text-[#2FD6FF] hover:brightness-110">{t.support.openTicket}</Link> {t.dep.withHash}
      </p>
      <BottomSheet
        open={coinOpen}
        onClose={() => setCoinOpen(false)}
        labelledBy={t.dep.selectAsset}
        title={t.dep.selectAssetT}
        icon={<MethodIcon m={m} size={36} />}
      >
        <ul className="space-y-2">
          {methods.map((mm, i) => (
            <li key={mm.id}>
              <button
                type="button"
                onClick={() => selectMethod(i)}
                aria-pressed={i === idx}
                className={`flex w-full items-center gap-3 rounded-[16px] border p-4 text-left transition ${
                  i === idx ? 'border-[rgba(47,214,255,0.6)] bg-[rgba(47,214,255,0.05)]' : 'border-[#202A3A] bg-[#0D1119] hover:border-[rgba(47,214,255,0.4)]'
                }`}
              >
                <MethodIcon m={mm} size={40} />
                <span className="flex-1">
                  <span className="block text-[16px] font-bold text-white">{mm.asset}</span>
                  <span className="block font-mono text-[11px] tracking-[0.12em] text-[#2FD6FF]">{mm.network} · {mm.standard}</span>
                </span>
                {i === idx && <Check size={18} className="text-[#35D98B]" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  );
}
