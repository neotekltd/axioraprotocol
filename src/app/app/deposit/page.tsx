import Link from 'next/link';
import { PageHeader, SectionCard, TableWrap } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { getTransactions } from '@/lib/queries';

export const metadata = { title: 'Deposit' };

export default async function DepositPage() {
  const deposits = (await getTransactions(20)).filter((t) => t.type === 'deposit');

  return (
    <div>
      <PageHeader title="Deposit" sub="Fund your account from an external wallet." />
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="How deposits work">
          <ol className="list-decimal space-y-2 p-5 pl-10 text-sm text-mist/85">
            <li>Choose the asset and network below.</li>
            <li>Send funds to your assigned deposit address.</li>
            <li>Deposits credit automatically after network confirmations.</li>
          </ol>
          <p className="border-t border-line px-5 py-3 text-xs text-fog">Minimum deposit: $10.00 · Assets auto-convert to USDT on arrival.</p>
        </SectionCard>
        <SectionCard title="Deposit address">
          <div className="p-6">
            <div className="text-xs tracking-widest text-fog">STATUS</div>
            <div className="mt-2 font-bold">Deposit addresses are not configured</div>
            <p className="mt-2 text-sm text-fog">
              On-chain deposit addresses are issued from secure backend configuration, which has not
              been connected for this workspace yet. Your account, deployments and referral tracking
              work normally in the meantime — no address is shown rather than a placeholder one.
            </p>
            <Link href="/app/support" className="mt-4 inline-block rounded-xl border border-line px-5 py-2.5 text-sm hover:border-pulse/50">
              Ask support about deposits
            </Link>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Recent deposits">
        {deposits.length === 0 ? (
          <p className="p-6 text-sm text-fog">No deposits recorded yet.</p>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">DATE</th><th className="p-4 text-right">AMOUNT</th><th className="p-4 text-right">STATUS</th><th className="p-4 text-right">TX HASH</th></tr></thead>
              <tbody>
                {deposits.map((t) => (
                  <tr key={t.id} className="border-t border-line">
                    <td className="p-4 text-fog">{t.createdAt.slice(0, 10)}</td>
                    <td className="p-4 text-right font-mono">{formatUSD(t.amount)} {t.asset}</td>
                    <td className="p-4 text-right text-fog">{t.status}</td>
                    <td className="p-4 text-right font-mono text-xs text-fog">{t.txHash ? `${t.txHash.slice(0, 10)}…` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </SectionCard>
    </div>
  );
}
