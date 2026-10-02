import { DepositView } from '@/components/DepositView';
import { getDepositViewProps } from '@/lib/deposit-view-props';

export const metadata = { title: 'Wallet' };

// Bottom-nav Wallet destination: the wallet deposit hub (Deposit view with
// Deposit | Withdraw | History tabs). Same component and same server props
// as /app/deposit — one data path, no duplicate route. Balances remain on
// the dashboard/portfolio, saved addresses at /app/wallets, full history at
// /app/transactions; nothing was removed, only the entry view matches the
// wallet hub structure.
export default async function WalletPage() {
  const props = await getDepositViewProps();
  return <DepositView {...props} />;
}
