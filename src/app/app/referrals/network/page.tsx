import { PageHeader, SectionCard, EmptyState } from '@/components/data';
import { getReferrals } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Referral network' };

export default async function ReferralNetworkPage() {
  const t = getDict();
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
      <PageHeader title={t.rn.netTitle} sub={t.rn.netSub} />
      {referrals.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={t.rn.netEmpty}
            body={t.rn.netEmptyB}
            actionLabel={t.rn.getLink}
            actionHref="/app/referrals"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {levels.map((lv) => {
            const n = (byLevel.get(lv) ?? []).length;
            return (
            <SectionCard key={lv} title={n === 1 ? t.rn.level1.replace('{l}', String(lv)).replace('{n}', '1') : t.rn.levelN.replace('{l}', String(lv)).replace('{n}', String(n))}>
              <ul className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {(byLevel.get(lv) ?? []).map((r) => (
                  <li key={r.id} className="rounded-xl border border-line bg-void px-4 py-3 text-sm">
                    <div className="font-mono text-pulse">{t.rn.refAccount}</div>
                    <div className="mt-0.5 text-xs text-fog">{t.ref.joined.replace('{d}', r.createdAt.slice(0, 10))}</div>
                  </li>
                ))}
              </ul>
            </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
