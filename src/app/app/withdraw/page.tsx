import { WithdrawForm } from '@/components/WithdrawForm';
import { getPortfolioSummary, getWallets } from '@/lib/queries';

export const metadata = { title: 'Withdraw' };

export default async function WithdrawPage() {
  const [summary, wallets] = await Promise.all([getPortfolioSummary(), getWallets()]);
  return <WithdrawForm available={summary.available} wallets={wallets} />;
}
