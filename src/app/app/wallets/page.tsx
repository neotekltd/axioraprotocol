import Link from 'next/link';
import { PageHeader, SectionCard } from '@/components/data';
import { WalletsManager } from '@/components/WalletsManager';
import { getWallets } from '@/lib/queries';

export const metadata = { title: 'Saved Wallets' };

export default async function WalletsPage() {
  const wallets = await getWallets();
  return (
    <div>
      <PageHeader
        title="Saved Wallets"
        sub="Destination addresses for withdrawals. New addresses require verification before use."
        actions={<Link href="/app/wallet" className="rounded-xl border border-line px-5 py-2.5 text-sm hover:border-pulse/50">Back to wallet</Link>}
      />
      <SectionCard title={`${wallets.length} saved address${wallets.length === 1 ? '' : 'es'}`}>
        <WalletsManager initial={wallets} />
      </SectionCard>
    </div>
  );
}
