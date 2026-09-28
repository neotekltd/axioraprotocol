import Link from 'next/link';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Reveal } from '@/components/Reveal';
import { PhoneVisual } from '@/components/sections/PhoneVisual';

// Resolved once at build/prerender: no wasted /phone-protocol-stats.png
// request (and no console 404) when the supplied asset hasn't been placed
// in public/ yet. Dropping the file in re-enables it on next build.
function hasPhoneAsset() {
  try {
    return existsSync(join(process.cwd(), 'public', 'phone-protocol-stats.png'));
  } catch {
    return false;
  }
}

export function BeyondScriptsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto grid max-w-page items-center gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-24">
        <div>
          <Reveal>
            <h2 className="t-h2 text-4xl sm:text-5xl lg:text-6xl">
              Beyond Scripts.
              <br />
              Trading by <span className="text-pulse">Consensus.</span>
            </h2>
            <p className="t-body mt-6 max-w-lg text-[1.0625rem] text-mist/75">
              Traditional bots follow predetermined rules. Axiora&apos;s architecture combines independent
              intelligence layers before an execution decision is authorized.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-4">
              <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="t-metric text-2xl text-white">$185.5K</div>
                <div className="mt-1 text-xs text-fog">Settled volume (demo)</div>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="t-metric text-2xl text-pulse">+5.4%</div>
                <div className="mt-1 text-xs text-fog">30-day estimate (demo)</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/protocol" className="inline-block rounded-xl border border-line px-7 py-3.5 text-[0.9375rem] hover:border-pulse/50">
                Explore Architecture
              </Link>
              <Link href="/statistics" className="inline-block rounded-xl bg-pulse px-7 py-3.5 text-[0.9375rem] font-semibold text-black shadow-glow hover:brightness-110">
                Protocol Stats
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={150}>
          <PhoneVisual hasAsset={hasPhoneAsset()} />
        </Reveal>
      </div>
    </section>
  );
}
