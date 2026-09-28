import { PageHeader, SectionCard, EmptyState } from '@/components/data';
import { getReferrals } from '@/lib/queries';

export const metadata = { title: 'Referral network' };

export default async function ReferralNetworkPage() {
  const referrals = await getReferrals();
  const byLevel = new Map<number, typeof referrals>();
  referrals.forEach((r) => {
    const arr = byLevel.get(r.level) ?? [];
    arr.push(r);
    byLevel.set(r.level, arr);
  });
  const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);

  return (
    <div>
      <PageHeader title="Referral Network" sub="Your downline by depth level. Depth capped at 5 levels." />
      {referrals.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Your network is empty"
            body="Referred accounts appear here grouped by level. Only counts are shown — no private information about other users is exposed."
            actionLabel="Get your link"
            actionHref="/app/referrals"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {levels.map((lv) => (
            <SectionCard key={lv} title={`Level ${lv} — ${(byLevel.get(lv) ?? []).length} referral${(byLevel.get(lv) ?? []).length === 1 ? '' : 's'}`}>
              <ul className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {(byLevel.get(lv) ?? []).map((r) => (
                  <li key={r.id} className="rounded-xl border border-line bg-void px-4 py-3 text-sm">
                    <div className="font-mono text-pulse">Referred account</div>
                    <div className="mt-0.5 text-xs text-fog">Joined {r.createdAt.slice(0, 10)}</div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
