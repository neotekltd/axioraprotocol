'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, QrCode } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/data';
import { PROTOCOL_CONFIG } from '@/lib/config';
import type { WalletTxn } from '@/lib/queries';
import { formatUSD } from '@/lib/plans';

function CopyBtn({ text, label, disabled }: { text: string; label: string; disabled?: boolean }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    if (disabled) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* unavailable */
    }
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };
  return (
    <button
      onClick={copy} disabled={disabled} aria-live="polite"
      className="flex items-center gap-1.5 rounded-[12px] border border-[#2A394D] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:border-[rgba(47,214,255,0.5)] disabled:opacity-40"
    >
      {done ? <Check size={15} className="text-[#35D98B]" /> : <Copy size={15} />}
      {done ? 'Copied' : label}
    </button>
  );
}

export function DepositView({ deposits, asset, network }: { deposits: WalletTxn[]; asset: string; network: string }) {
  const [qrOpen, setQrOpen] = useState(false);
  // No deposit addresses are configured yet: QR/copy stay disabled and no
  // QR is rendered, because a QR must encode a real address — never a fake.
  const configured = false;
  const address = '';

  return (
    <div>
      <PageHeader title="Deposit" sub="Fund your account from an external wallet." />
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title={`Send USDT`}>
          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">ASSET / NETWORK</div>
              <div className="mt-1 font-mono text-[15px] font-bold text-white">{asset} / {network}</div>
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">STATUS</div>
              <div className="mt-1 text-[14px] font-semibold text-[#F2BF4A]">Waiting — no deposit address configured</div>
            </div>
            <div className="rounded-[14px] border border-[rgba(242,191,74,0.35)] bg-[rgba(242,191,74,0.06)] p-4 text-[13px] leading-relaxed text-[#AAB5C7]" role="note">
              Only send {PROTOCOL_CONFIG.supportedAssets.join(', ')} to Axiora-assigned addresses shown here.
              Sending any other asset or network will result in loss of funds.
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setQrOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-[12px] border border-[#2A394D] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:border-[rgba(47,214,255,0.5)]"
                aria-expanded={qrOpen}
              >
                <QrCode size={15} />{qrOpen ? 'Hide QR code' : 'Show QR code'}
              </button>
              <CopyBtn text={address} label="Copy address" disabled={!configured} />
            </div>
            {qrOpen && (
              <div className="rounded-[14px] border border-dashed border-[#2A394D] p-6 text-center" role="status">
                <p className="text-[14px] font-semibold text-white">No QR available</p>
                <p className="mx-auto mt-1 max-w-xs text-[13px] text-[#78859A]">
                  A QR code appears here automatically once your deposit address is issued.
                  QR codes always encode the real assigned address — never a placeholder.
                </p>
              </div>
            )}
            <p className="text-[12px] text-[#78859A]">Minimum deposit {formatUSD(10, { decimals: 0 })}. Assets convert to USDT on arrival.</p>
          </div>
        </SectionCard>
        <SectionCard title="Progress">
          <ol className="space-y-0 p-5 sm:p-6">
            {(
              [
                ['Address ready', 'An address is assigned to your account.', false],
                ['Waiting for your transfer', 'Send funds; the watcher detects the transaction.', false],
                ['Plan starts', 'Confirmed deposits credit and activate your module.', false],
              ] as [string, string, boolean][]
            ).map(([t, d, done], i, arr) => (
              <li key={t} className="relative flex gap-3 pb-5 last:pb-0">
                {i < arr.length - 1 && <span className="absolute left-[13px] top-8 h-[calc(100%-2rem)] w-px bg-[#2A394D]" aria-hidden="true" />}
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[11px] ${done ? 'border-[rgba(53,217,139,0.5)] text-[#35D98B]' : 'border-[#2A394D] text-[#596579]'}`} aria-hidden="true">
                  {done ? <Check size={13} /> : `0${i + 1}`}
                </span>
                <div>
                  <div className="text-[14px] font-semibold text-white">{t}</div>
                  <div className="text-[13px] text-[#78859A]">{d}</div>
                </div>
              </li>
            ))}
          </ol>
          <p className="border-t border-[#202A3A] px-5 py-3 text-[12px] text-[#78859A]">Steps complete only when the backend confirms each stage.</p>
        </SectionCard>
      </div>
      <SectionCard title="Recent deposits">
        {deposits.length === 0 ? (
          <p className="p-6 text-[14px] text-[#78859A]">No deposits recorded yet.</p>
        ) : (
          <ul className="divide-y divide-[#202A3A]/70">
            {deposits.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-4 text-[14px] transition hover:bg-[#111722]/60">
                <div>
                  <span className="font-mono text-white">{t.asset}</span>
                  <span className="ml-2 font-mono text-[12px] text-[#78859A]">{t.txHash ? `${t.txHash.slice(0, 10)}…` : 'pending hash'}</span>
                  <div className="mt-0.5 font-mono text-[11px] text-[#78859A]">{t.createdAt.slice(0, 10)}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-white">{formatUSD(t.amount)}</div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#78859A]">{t.status}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
      <p className="mt-4 text-[12px] text-[#78859A]">
        Need help? <Link href="/app/support" className="text-[#2FD6FF]">Ask support about deposits</Link>.
      </p>
    </div>
  );
}
