import Link from 'next/link';
import { PageHeader, SectionCard } from '@/components/data';
import { WalletsManager } from '@/components/WalletsManager';
import { getWallets } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Saved Wallets' };

export default async function WalletsPage() {
  const t = getDict();
  const wallets = await getWallets();
  return (
    <div>
      <PageHeader
        title={t.wmgr.title}
        sub={t.wmgr.sub}
        actions={<Link href="/app/wallet" className="rounded-xl border border-line px-5 py-2.5 text-sm hover:border-pulse/50">{t.wmgr.backWallet}</Link>}
      />
      <SectionCard title={wallets.length === 1 ? t.wmgr.saved1.replace('{n}', '1') : t.wmgr.savedN.replace('{n}', String(wallets.length))}>
        <WalletsManager initial={wallets} />
      </SectionCard>
    </div>
  );
}
