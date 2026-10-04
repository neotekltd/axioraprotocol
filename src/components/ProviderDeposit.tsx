'use client';

// Automatic provider deposit panel. Creates a NOWPayments payment
// server-side, displays the provider-issued pay address/amount/QR, and
// tracks authoritative status (polled + manual refresh). Never marks funds
// complete from the browser — credit happens only via verified IPN.
import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode } from 'lucide-react';
import { CopyButton, StatusPill, TechnicalWarning } from '@/components/ax/wallet';

interface ProviderPayment {
  paymentId: string;
  payAddress: string | null;
  payAmount: number | null;
  payCurrency: string | null;
  priceAmount: number | null;
  priceCurrency: string;
  orderId: string | null;
  status: string;
  label: string;
}

type Tone = 'amber' | 'green' | 'cyan';

function toneFor(status: string): Tone {
  switch (status) {
    case 'finished':
    case 'confirmed':
      return 'green';
    case 'sending':
      return 'cyan';
    default:
      return 'amber';
  }
}

const TERMINAL = new Set(['finished', 'failed', 'refunded', 'expired']);

export function ProviderDeposit({ assetId, amount, networkLabel }: {
  assetId: string;
  amount: number;
  networkLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<ProviderPayment | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const create = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === 'PROVIDER_UNAVAILABLE'
          ? 'Payment provider is unreachable. Try again or use the manual route below.'
          : 'Could not create the payment. Try again.');
        return;
      }
      setPayment(data.payment as ProviderPayment);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }, [assetId, amount]);

  const refresh = useCallback(async () => {
    if (!payment) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/payments/deposit?paymentId=${encodeURIComponent(payment.paymentId)}`);
      if (res.ok) {
        const data = await res.json();
        setPayment(data.payment as ProviderPayment);
      }
    } finally {
      setRefreshing(false);
    }
  }, [payment]);

  // Auto-refresh while the payment is in flight; stops at terminal states.
  useEffect(() => {
    if (!payment || TERMINAL.has(payment.status)) return;
    timer.current = setInterval(() => void refresh(), 20000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [payment, refresh]);

  // QR encodes the provider-issued pay address — nothing else.
  useEffect(() => {
    if (!qrOpen || !payment?.payAddress) return;
    let live = true;
    QRCode.toDataURL(payment.payAddress, { width: 220, margin: 1 })
      .then((url) => { if (live) setQr(url); })
      .catch(() => { if (live) setQr(null); });
    return () => { live = false; };
  }, [qrOpen, payment?.payAddress]);

  if (!payment) {
    return (
      <div>
        <button
          type="button"
          onClick={() => void create()}
          disabled={busy}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#2FD6FF] text-[15px] font-bold text-[#06121A] shadow-[0_0_28px_rgba(47,214,255,0.25)] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
        >
          {busy ? 'Creating secure payment…' : 'Create secure payment'}
        </button>
        {error && <p role="alert" className="mt-2 text-[13px] font-semibold text-[#F2BF4A]">{error}</p>}
        <p className="mt-3 text-center font-mono text-[11px] tracking-[0.12em] text-[#78859A]">
          CRYPTO PAYMENTS PROCESSED BY{' '}
          <a href="https://nowpayments.io/" target="_blank" rel="noopener noreferrer" className="text-[#2FD6FF] hover:brightness-110">
            NOWPAYMENTS
          </a>
        </p>
      </div>
    );
  }

  const done = payment.status === 'finished';
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[19px] font-bold text-white">
            Send {payment.payAmount ?? amount} {(payment.payCurrency ?? '').toUpperCase()}
          </div>
          <div className="mt-0.5 text-[13px] text-[#78859A]">on {networkLabel}</div>
        </div>
        <StatusPill tone={toneFor(payment.status)}>{payment.label}</StatusPill>
      </div>
      <button
        type="button"
        onClick={() => setQrOpen((v) => !v)}
        aria-expanded={qrOpen}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#2A394D] bg-[#111722] text-[14px] font-bold text-white transition hover:border-[rgba(47,214,255,0.5)]"
      >
        <QrCode size={17} aria-hidden="true" /> {qrOpen ? 'Hide QR code' : 'Show QR code'}
      </button>
      {qrOpen && (
        <div className="mt-3 flex flex-col items-center rounded-[14px] border border-[#2A394D] bg-white p-5">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR code for provider pay address" width={220} height={220} />
          ) : (
            <p className="text-[13px] text-[#78859A]">QR unavailable.</p>
          )}
          <p className="mt-2 font-mono text-[11px] text-black/60">Encodes the exact address below — nothing else.</p>
        </div>
      )}
      <div className="mt-5 text-[14px] text-[#AAB5C7]">To this address</div>
      <div className="mt-2 break-all rounded-[14px] border border-[#2A394D] bg-[#080B12] p-4 font-mono text-[15px] leading-relaxed text-white" style={{ overflowWrap: 'anywhere' }}>
        {payment.payAddress ?? 'Address pending…'}
      </div>
      {payment.payAddress && (
        <div className="mt-3 space-y-2.5">
          <CopyButton text={payment.payAddress} label="Copy address" primary />
          {payment.payAmount != null && <CopyButton text={String(payment.payAmount)} label={`Copy ${payment.payAmount}`} />}
        </div>
      )}
      <dl className="mt-4 space-y-1.5 font-mono text-[12px]">
        <div className="flex justify-between gap-3">
          <dt className="tracking-[0.18em] text-[#78859A]">PAYMENT ID</dt>
          <dd className="break-all text-right text-white">{payment.paymentId}</dd>
        </div>
        {payment.orderId && (
          <div className="flex justify-between gap-3">
            <dt className="tracking-[0.18em] text-[#78859A]">ORDER</dt>
            <dd className="text-white">{payment.orderId}</dd>
          </div>
        )}
      </dl>
      <div className="mt-3">
        <TechnicalWarning
          title={`Only ${(payment.payCurrency ?? '').toUpperCase()} to this address.`}
          body="Another coin, or funds sent on another network, cannot be recovered automatically."
        />
      </div>
      {!done && !TERMINAL.has(payment.status) && (
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-[14px] border border-[#2A394D] bg-[#111722] text-[14px] font-bold text-white transition hover:border-[rgba(47,214,255,0.55)] disabled:opacity-50"
        >
          {refreshing ? 'Checking…' : 'Refresh status'}
        </button>
      )}
      {done && (
        <p role="status" className="mt-3 rounded-[14px] border border-[rgba(53,217,139,0.4)] bg-[rgba(53,217,139,0.08)] p-4 text-center text-[14px] font-bold text-[#35D98B]">
          Payment completed — your balance is updated.
        </p>
      )}
      <p className="mt-3 text-center font-mono text-[11px] tracking-[0.12em] text-[#78859A]">
        CRYPTO PAYMENTS PROCESSED BY{' '}
        <a href="https://nowpayments.io/" target="_blank" rel="noopener noreferrer" className="text-[#2FD6FF] hover:brightness-110">
          NOWPAYMENTS
        </a>
      </p>
    </div>
  );
}
