import { PageHeader } from '@/components/data';
import { TransactionsView } from '@/components/TransactionsView';
import { WalletTabs } from '@/components/ax/wallet';
import { getTransactions } from '@/lib/queries';

export const metadata = { title: 'Transactions' };

export default async function TransactionsPage() {
  const txns = await getTransactions(200);
  return (
    <div>
      <PageHeader title="Transactions" sub="Full ledger history. Filter by type, status, or search by ID, hash or address." />
      <div className="mt-6">
        <WalletTabs active="history" />
      </div>
      <TransactionsView initial={txns} />
    </div>
  );
}
