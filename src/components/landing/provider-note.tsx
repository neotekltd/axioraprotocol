import { providerEnabled } from '@/lib/nowpayments';

// Subtle, factual provider disclosure. Renders ONLY when the NOWPayments
// rail is configured and live. Wording is deliberately limited to what the
// integration is — no certification, partnership or endorsement claims.
export function ProviderNote() {
  if (!providerEnabled()) return null;
  return (
    <p className="border-b border-white/5 bg-void/60 pb-4 text-center font-mono text-[10px] tracking-[0.22em] text-fog">
      CRYPTO PAYMENTS PROCESSED BY{' '}
      <a
        href="https://nowpayments.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-pulse hover:brightness-110"
      >
        NOWPAYMENTS
      </a>
    </p>
  );
}
