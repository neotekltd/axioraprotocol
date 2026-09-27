import { DEMO_TRANSACTIONS } from '@/lib/mock';
import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Transactions' };

export default function TransactionsPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Transactions</h1><DemoBadge /></div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {['Deposit', 'Withdrawal', 'Deployment', 'Profit', 'Referral Reward', 'Fee'].map((f) => (<span key={f} className="rounded-full border border-line px-3 py-1.5 text-fog">{f}</span>))}
      </div>
      <Card className="mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fog text-[11px]"><th className="p-4">ID</th><th className="p-4">TYPE</th><th className="p-4 text-right">AMOUNT</th><th className="p-4">ASSET</th><th className="p-4 text-right">STATUS</th><th className="p-4 text-right">TIME</th></tr></thead>
          <tbody>
            {DEMO_TRANSACTIONS.map((t) => (
              <tr key={t.id} className="border-t border-line">
                <td className="p-4 font-mono">{t.id}</td><td className="p-4">{t.type}</td>
                <td className="p-4 text-right">${t.amount}</td><td className="p-4">{t.asset}</td>
                <td className="p-4 text-right">{t.status}</td><td className="p-4 text-right">{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
