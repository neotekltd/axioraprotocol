'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Copy, QrCode } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/data';
import { formatUSD } from '@/lib/plans';
import type { WalletTxn } from '@/lib/queries';
import type { DepositMethod } from '@/lib/deposits';

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
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
      onClick={copy} aria-live="polite"
      className="flex items-center gap-1.5 rounded-[12px] border border-[#2A394D] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:border-[rgba(47,214,255,0.5)]"
    >
      {done ? <Check size={15} className="text-[#35D98B]" /> : <Copy size={15} />}
      {done ? 'Copied' : label}
    </button>
  );
}

export function DepositView({ methods, deposits, qr }: {
  methods: DepositMethod[];
  deposits: WalletTxn[];
  qr: Record<string, string>;
}) {
  const [idx, setIdx] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);
  const m = methods[idx];

  if (!m) {
    return (
      <div>
        <PageHeader title="Deposit" sub="Fund your account from an external wallet." />
        <SectionCard title="Deposit address">
          <div className="p-6">
            <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">STATUS</div>
            <div className="mt-2 text-[17px] font-bold text-white">Deposit addresses are not configured</div>
            <p className="mt-2 text-[14px] text-[#AAB5C7]">
              On-chain deposit addresses are issued from secure backend configuration, which has not
              been connected for this workspace yet. No address is shown rather than a placeholder one.
            </p>
            <Link href="/app/support" className="mt-4 inline-block rounded-[14px] border border-[#2A394D] px-5 py-2.5 text-[14px] font-semibold text-white hover:border-[rgba(47,214,255,0.5)]">
              Ask support about deposits
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  const key = m.id;
  const recent = deposits.filter((t) => t.asset === m.asset);

  return (
    <div>
      <PageHeader title="Deposit" sub="Fund your account from an external wallet." />
      <div className="mt-6 grid gap-4" role="radiogroup" aria-label="Deposit method">
        {methods.map((mm, i) => (
          <button
            key={mm.id} role="radio" aria-checked={i === idx} onClick={() => { setIdx(i); setQrOpen(false); }}
            className={`flex items-center gap-4 rounded-[20px] border p-5 text-left transition ${i === idx ? 'border-[rgba(47,214,255,0.6)] bg-[rgba(47,214,255,0.05)]' : 'border-[#202A3A] bg-[#0D111A] hover:border-[rgba(47,214,255,0.4)]'}`}
          >
            {mm.icon ? (
              <Image src={mm.icon} alt={mm.asset} width={48} height={48} className="h-12 w-12 shrink-0 rounded-full" />
            ) : (
              <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#2A394D] bg-[#151B27] font-mono text-[18px] font-bold text-[#2FD6FF]">
                {mm.asset.slice(0, 1)}
              </span>
            )}
            <span>
              <span className="block text-[17px] font-bold text-white">{mm.asset}</span>
              <span className="block text-[13px] text-[#78859A]">{mm.assetName}</span>
              <span className="mt-1 block font-mono text-[11px] tracking-[0.12em] text-[#2FD6FF]">{mm.network} · {mm.standard}</span>
            </span>
          </button>
        ))}
      </div>

      <SectionCard title="Deposit address">
        <div className="space-y-4 p-5 sm:p-6">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">
            {m.asset} · {m.network} · {m.standard}
          </div>
          <div
            className="break-all rounded-[14px] border border-[#2A394D] bg-[#080B12] p-4 font-mono text-[15px] leading-relaxed text-white"
            style={{ overflowWrap: 'anywhere' }}
          >
            {m.depositAddress}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQrOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-[12px] border border-[#2A394D] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:border-[rgba(47,214,255,0.5)]"
              aria-expanded={qrOpen}
            >
              <QrCode size={15} />{qrOpen ? 'Hide QR code' : 'Show QR code'}
            </button>
            <CopyBtn text={m.depositAddress} label="Copy address" />
          </div>
          {qrOpen && (
            <div className="flex flex-col items-center rounded-[14px] border border-[#2A394D] bg-white p-5">
              {qr[key] ? (
                <span dangerouslySetInnerHTML={{ __html: qr[key] }} role="img" aria-label={`QR code for ${m.depositAddress}`} />
              ) : (
                <p className="text-[13px] text-[#78859A]">QR unavailable.</p>
              )}
              <p className="mt-2 font-mono text-[11px] text-black/60">Encodes the exact address above — nothing else.</p>
            </div>
          )}
          <div className="rounded-[14px] border border-[rgba(242,191,74,0.35)] bg-[rgba(242,191,74,0.06)] p-4 text-[13px] leading-relaxed text-[#AAB5C7]" role="note">
            Send {m.asset} only through the {m.network} / {m.standard} network to this address.
            Do not send {m.asset} through any other network — funds sent on the wrong network cannot be recovered.
          </div>
          {m.feeNote && <p className="text-[12px] text-[#78859A]">{m.feeNote}</p>}
        </div>
      </SectionCard>

      <SectionCard title="Progress">
        <ol className="p-5 sm:p-6">
          {[
            ['Address ready', 'An address is assigned to your account.', true],
            ['Waiting for your transfer', 'Send funds; the watcher detects the transaction.', recent.some((t) => t.status === 'pending' || t.status === 'processing')],
            ['Plan starts', 'Confirmed deposits credit and activate your module.', recent.some((t) => t.status === 'completed')],
          ].map(([t, d, done], i, arr) => (
            <li key={t as string} className="relative flex gap-3 pb-5 last:pb-0">
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

      <SectionCard title="Recent deposits">
        {recent.length === 0 ? (
          <p className="p-6 text-[14px] text-[#78859A]">No deposits recorded yet.</p>
        ) : (
          <ul className="divide-y divide-[#202A3A]/70">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-4 text-[14px]">
                <div>
                  <span className="font-mono text-white">{t.asset}</span>
                  <span className="ml-2 font-mono text-[12px] text-[#78859A]">{t.txHash ? `${t.txHash.slice(0, 12)}…` : 'awaiting hash'}</span>
                  <div className="mt-0.5 font-mono text-[11px] text-[#78859A]">{t.createdAt.slice(0, 10)} · {t.status}</div>
                </div>
                <div className="font-mono text-white">{formatUSD(t.amount)}</div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
