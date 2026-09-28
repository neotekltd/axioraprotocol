import { PageHeader } from '@/components/data';
import { TradesView } from '@/components/TradesView';
import { getTrades } from '@/lib/queries';

export const metadata = { title: 'Trades' };

export default async function TradesPage() {
  const trades = await getTrades();
  return (
    <div>
      <PageHeader title="Trading Activity" sub="Open positions and closed-trade history from protocol execution." />
      <TradesView initial={trades} />
    </div>
  );
}
