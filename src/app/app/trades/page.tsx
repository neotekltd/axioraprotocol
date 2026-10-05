import { PageHeader } from '@/components/data';
import { TradesView } from '@/components/TradesView';
import { getTrades } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Trades' };

export default async function TradesPage() {
  const t = getDict();
  const trades = await getTrades();
  return (
    <div>
      <PageHeader title={t.rail.tradingActivity} sub={t.rail.tradingSub} />
      <TradesView initial={trades} />
    </div>
  );
}
