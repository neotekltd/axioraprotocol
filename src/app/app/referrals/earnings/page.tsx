import { PageHeader, SectionCard, TableWrap, StatusBadge, EmptyState } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { getReferralEarnings } from '@/lib/queries';

export const metadata = { title: 'Referral earnings' };

export default async function ReferralEarningsPage() {
  const earnings = await getReferralEarnings();
  const total = earnings.filter((e) => e.status === 'available').reduce((a, e) => a + e.amount, 0);

  return (
    <div>
      <PageHeader title="Referral Earnings" sub={`Lifetime available earnings: ${formatUSD(total)}`} />
      {earnings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No referral earnings yet"
            body="Instant bonuses land when a referral deploys capital; daily shares accrue on positive protocol results. Share your link to begin."
            actionLabel="Open referrals"
            actionHref="/app/referrals"
          />
        </div>
      ) : (
        <SectionCard title={`${earnings.length} reward${earnings.length === 1 ? '' : 's'}`}>
          <TableWrap>
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">DATE</th><th className="p-4">TYPE</th><th className="p-4">LEVEL</th><th className="p-4 text-right">AMOUNT</th><th className="p-4 text-right">STATUS</th></tr></thead>
              <tbody>
                {earnings.map((e) => (
                  <tr key={e.id} className="border-t border-line">
                    <td className="p-4 text-fog">{e.createdAt.slice(0, 10)}</td>
                    <td className="p-4 capitalize">{e.kind === 'instant' ? 'Instant bonus' : 'Daily share'}</td>
                    <td className="p-4">L{e.level}</td>
                    <td className="p-4 text-right font-mono text-pulse">+{formatUSD(e.amount)}</td>
                    <td className="p-4 text-right"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </SectionCard>
      )}
      <p className="mt-4 text-xs text-fog">Each reward snapshots its rate at calculation time; history never re-prices on config change.</p>
    </div>
  );
}
