import { PageHeader } from '@/components/data';
import { TransactionsView } from '@/components/TransactionsView';
import { getTransactions } from '@/lib/queries';

export const metadata = { title: 'Transactions' };

export default async function TransactionsPage() {
  const txns = await getTransactions(200);
  return (
    <div>
      <PageHeader title="Transactions" sub="Full ledger history. Filter by type, status, or search by ID, hash or address." />
      <TransactionsView initial={txns} />
    </div>
  );
}
