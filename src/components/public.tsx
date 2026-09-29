// Shared public-page primitives (server components).
// One visual language across all landing pages: eyebrow, title, lede,
// feature cards, CTA band. No duplicated hero code per page.

import Link from 'next/link';
import type { ReactNode } from 'react';

export function PageHero({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-40 sm:px-6 md:pt-44">
      <div className="max-w-3xl">
        <div className="text-[11px] font-semibold tracking-[0.28em] text-pulse">{eyebrow}</div>
        <h1 className="t-h1 mt-3 text-4xl sm:text-5xl">{title}</h1>
        {lede && <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-mist/75">{lede}</p>}
      </div>
    </div>
  );
}

export function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="font-bold">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-fog">{body}</p>
    </div>
  );
}

export function StepCard({ index, title, body }: { index: string; title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="font-mono text-sm font-bold text-pulse">{index}</div>
      <div className="mt-2 text-lg font-bold">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-fog">{body}</p>
    </div>
  );
}

export function CTASection({
  title,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="glass mt-16 rounded-3xl p-8 text-center sm:p-12">
        <h2 className="t-h2 text-3xl sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-fog">{body}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={primaryHref} className="rounded-xl bg-pulse px-6 py-3 text-sm font-bold text-black hover:brightness-110">
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link href={secondaryHref} className="rounded-xl border border-line px-6 py-3 text-sm hover:border-pulse/50">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl space-y-4 px-4 text-sm leading-relaxed text-mist/80 sm:px-6">{children}</div>;
}
