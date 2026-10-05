import { PageHeader, SectionCard, TableWrap, StatusBadge, EmptyState } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { getReferralEarnings } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';
import { stWord } from '@/lib/i18n-dict';

export const metadata = { title: 'Referral earnings' };

export default async function ReferralEarningsPage() {
  const t = getDict();
  const earnings = await getReferralEarnings();
  const total = earnings.filter((e) => e.status === 'available').reduce((a, e) => a + e.amount, 0);

  return (
    <div>
      <PageHeader title={t.rn.earnTitle} sub={t.rn.earnSub.replace('{x}', formatUSD(total))} />
      {earnings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={t.rn.noEarn}
            body={t.rn.noEarnB}
            actionLabel={t.rn.openRef}
            actionHref="/app/referrals"
          />
        </div>
      ) : (
        <SectionCard title={earnings.length === 1 ? t.rn.rewards1.replace('{n}', '1') : t.rn.rewardsN.replace('{n}', String(earnings.length))}>
          <TableWrap>
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">{t.tx.cDate}</th><th className="p-4">{t.tx.cType}</th><th className="p-4">{t.referrals.level.replace('{n}', '').trim()}</th><th className="p-4 text-right">{t.tx.cAmount}</th><th className="p-4 text-right">{t.tx.cStatus}</th></tr></thead>
              <tbody>
                {earnings.map((e) => (
                  <tr key={e.id} className="border-t border-line">
                    <td className="p-4 text-fog">{e.createdAt.slice(0, 10)}</td>
                    <td className="p-4 capitalize">{e.kind === 'instant' ? t.rn.instantB : t.rn.dailySh}</td>
                    <td className="p-4">L{e.level}</td>
                    <td className="p-4 text-right font-mono text-pulse">+{formatUSD(e.amount)}</td>
                    <td className="p-4 text-right"><StatusBadge status={e.status} label={stWord(t, e.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </SectionCard>
      )}
      <p className="mt-4 text-xs text-fog">{t.rn.snapNote}</p>
    </div>
  );
}
