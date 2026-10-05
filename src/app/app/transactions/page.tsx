import { PageHeader } from '@/components/data';
import { TransactionsView } from '@/components/TransactionsView';
import { WalletTabs } from '@/components/ax/wallet';
import { getTransactions } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Transactions' };

export default async function TransactionsPage() {
  const t = getDict();
  const txns = await getTransactions(200);
  return (
    <div>
      <PageHeader title={t.transactions.title} sub={t.tx.pageSub} />
      <div className="mt-6">
        <WalletTabs active="history" />
      </div>
      <TransactionsView initial={txns} />
    </div>
  );
}
