import { DepositView } from '@/components/DepositView';
import { getTransactions } from '@/lib/queries';

export const metadata = { title: 'Deposit' };

export default async function DepositPage() {
  const deposits = (await getTransactions(20)).filter((t) => t.type === 'deposit');
  return <DepositView deposits={deposits} asset="USDT" network="TRC20" />;
}
