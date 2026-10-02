import { DepositView } from '@/components/DepositView';
import { getDepositViewProps } from '@/lib/deposit-view-props';

export const metadata = { title: 'Deposit' };

export default async function DepositPage() {
  const props = await getDepositViewProps();
  return <DepositView {...props} />;
}
