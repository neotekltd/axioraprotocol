'use client';
import { useState } from 'react';
import Image from 'next/image';

// Beyond-Scripts phone visual. Uses the supplied protocol-stats phone
// asset at public/phone-protocol-stats.png when present; falls back to
// the original Axiora CSS dashboard concept otherwise.
const ASSET = '/phone-protocol-stats.png';

export function PhoneVisual({ hasAsset = true }: { hasAsset?: boolean }) {
  const [missing, setMissing] = useState(false);
  const showFallback = !hasAsset || missing;
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(0,210,148,0.16),transparent_70%)]" />
      {showFallback ? (
        <CssPhone />
      ) : (
        <Image
          src={ASSET}
          alt="Axiora protocol statistics on mobile"
          width={720}
          height={1440}
          className="relative h-auto w-full rounded-[2rem]"
          priority={false}
          onError={() => setMissing(true)}
        />
      )}
    </div>
  );
}

function CssPhone() {
  return (
    <div className="relative rounded-[2.25rem] border border-pulse/30 bg-void p-6 shadow-glow">
      <div className="text-[0.6875rem] tracking-[0.22em] text-fog">AXIORA</div>
      <div className="mt-1.5 text-xs text-fog">Portfolio</div>
      <div className="t-metric text-[1.75rem] text-white">$12,481.42</div>
      <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
        <div className="rounded-xl border border-line p-3.5">
          <div className="text-fog">Today&apos;s P&amp;L</div>
          <div className="t-metric mt-1 font-bold text-pulse">+$184.22</div>
        </div>
        <div className="rounded-xl border border-line p-3.5">
          <div className="text-fog">Active</div>
          <div className="t-metric mt-1 font-bold">3</div>
        </div>
      </div>
      <div className="mt-2.5 space-y-2.5 text-xs">
        <div className="flex justify-between rounded-xl border border-line p-3.5">
          <span>BTC/USDT LONG</span>
          <span className="t-metric text-pulse">+$82.12</span>
        </div>
        <div className="flex justify-between rounded-xl border border-line p-3.5">
          <span>ETH/USDT SHORT</span>
          <span className="t-metric text-pulse">+$41.92</span>
        </div>
      </div>
      <svg viewBox="0 0 260 90" className="mt-4 w-full">
        <polyline points="0,72 40,66 80,58 120,52 160,34 200,28 260,8" fill="none" stroke="#00D294" strokeWidth="2" />
      </svg>
      <div className="mt-1 text-center text-[0.6875rem] text-fog">Original Axiora dashboard concept · demo values</div>
    </div>
  );
}
