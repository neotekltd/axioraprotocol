import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { PROTOCOL_CONFIG } from '@/lib/config';

export function ReferralSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-page px-5 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-surface px-6 py-16 text-center md:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_50%_38%,rgba(0,210,148,0.12),transparent)]" />
            <div className="relative">
              <h2 className="t-h2 text-3xl sm:text-4xl md:text-5xl">Build Your Axiora Network</h2>
              <p className="t-body mx-auto mt-5 max-w-xl text-fog">
                Share Axiora Protocol with your network and track referral activity from one dashboard. Axiora
                defines its own referral economics.
              </p>
              <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
                <div className="rounded-2xl border border-line bg-void/60 p-5">
                  <div className="text-xs font-bold tracking-[0.2em] text-pulse">INSTANT BONUS</div>
                  <p className="mt-2 text-sm text-fog">Reward when a referral deploys capital. Rate snapshotted at deploy time.</p>
                </div>
                <div className="rounded-2xl border border-line bg-void/60 p-5">
                  <div className="text-xs font-bold tracking-[0.2em] text-pulse">DAILY PROFIT SHARE</div>
                  <p className="mt-2 text-sm text-fog">Recurring reward on positive protocol results, per level.</p>
                </div>
              </div>
              <div className="mx-auto mt-6 max-w-2xl overflow-hidden rounded-2xl border border-line">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-fog text-[0.6875rem] tracking-[0.2em]">
                      <th className="p-4">LEVEL</th>
                      <th className="p-4 text-right">INSTANT</th>
                      <th className="p-4 text-right">DAILY SHARE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROTOCOL_CONFIG.referralLevels.map((r) => (
                      <tr key={r.level} className="border-t border-line">
                        <td className="p-4">L{r.level}</td>
                        <td className="p-4 text-right">{r.instantPct}%</td>
                        <td className="p-4 text-right">{r.dailySharePct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mx-auto mt-3 max-w-2xl text-[0.6875rem] text-fog">Axiora economics, admin-configurable — never copied rates.</p>
              <ReferralTree />
              <Link href="/referrals" className="mt-10 inline-block rounded-xl bg-pulse px-8 py-4 text-[0.9375rem] font-semibold text-black shadow-glow hover:brightness-110">
                Explore Referral Program
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ReferralTree() {
  return (
    <div className="relative mx-auto mt-12 flex max-w-lg flex-col items-center text-xs" role="img" aria-label="Axiora referral network">
      <div className="rounded-xl border border-pulse/50 bg-pulse/10 px-6 py-2.5 font-bold tracking-[0.18em] text-pulse">YOU</div>
      <div className="h-6 w-px bg-pulse/60" />
      <div className="flex gap-8 md:gap-12">
        {['L1', 'L1', 'L1'].map((n, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="rounded-lg border border-line bg-void px-5 py-2">{n}</div>
            {i < 2 && (
              <>
                <div className="h-5 w-px bg-pulse/50" />
                <div className="rounded-lg border border-line bg-void px-4 py-1.5 text-[0.6875rem]">L2</div>
              </>
            )}
            {i === 0 && (
              <>
                <div className="h-4 w-px bg-pulse/40" />
                <div className="rounded-lg border border-line bg-void px-4 py-1.5 text-[0.6875rem]">L3</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
