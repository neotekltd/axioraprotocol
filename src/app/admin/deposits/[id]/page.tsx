import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader, SectionCard, StatusBadge } from '@/components/data';
import { DepositActions } from '@/components/admin/forms';
import { getAdminDeposits } from '@/lib/admin';
import { getDepositAddress } from '@/lib/deposits';
import { formatUSD } from '@/lib/finance';

export const metadata = { title: 'Admin deposit review' };

const EXPLORERS: Record<string, (tx: string) => string> = {
  TRON: (tx) => `https://tronscan.org/#/transaction/${tx}`,
  Ethereum: (tx) => `https://etherscan.io/tx/${tx}`,
  'BNB Smart Chain': (tx) => `https://bscscan.com/tx/${tx}`,
  Bitcoin: (tx) => `https://mempool.space/tx/${tx}`,
  Litecoin: (tx) => `https://litecoinspace.org/tx/${tx}`,
  Dogecoin: (tx) => `https://dogecha.in/tx/${tx}`,
};

function Row({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#202A3A]/60 px-5 py-3 text-[14px] last:border-0">
      <span className="shrink-0 text-[#78859A]">{k}</span>
      <span className={`break-all text-right text-white ${mono ? 'font-mono text-[13px]' : ''}`}>{v}</span>
    </div>
  );
}

export default async function AdminDepositReview({ params }: { params: { id: string } }) {
  const all = await getAdminDeposits('all');
  const d = all.find((r) => r.id === params.id);
  if (!d) notFound();
  const explorer = d.txHash && d.network && EXPLORERS[d.network] ? EXPLORERS[d.network](d.txHash) : null;
  const standard = (d.meta.standard as string | undefined) ?? '';
  // Expected recipient: resolve the CURRENT canonical address for the same
  // asset/network and compare with what was stored at submit time. A
  // mismatch means configuration changed since submission — investigate.
  const assetId = typeof d.meta.asset_id === 'string' ? d.meta.asset_id : null;
  const expectedNow = assetId ? getDepositAddress(assetId) : '';
  const recipientMatch = expectedNow !== '' && d.address !== null && d.address.trim() === expectedNow;
  return (
    <div>
      <Link href="/admin/deposits?status=pending" className="text-[14px] text-[#AAB5C7] hover:text-white">← Deposit queue</Link>
      <div className="mt-2">
        <PageHeader title={`Deposit ${d.id.slice(0, 8)}`} sub="Verify on the correct explorer before confirming." />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <StatusBadge status={d.status} />
        <span className="font-mono text-[13px] text-[#78859A]">{d.createdAt.slice(0, 16).replace('T', ' ')}</span>
      </div>
      <SectionCard title="Deposit">
        <Row k="Deposit ID" v={d.id} mono />
        <Row k="User" v={d.userEmail ?? d.userId} mono />
        <Row k="Asset" v={`${d.amount.toFixed(2)} ${d.asset}`} mono />
        <Row k="Network" v={`${d.network ?? '—'}${standard ? ` (${standard})` : ''}`} />
        <Row k="Amount claimed" v={formatUSD(d.amount)} />
        <Row k="Deposit address" v={d.address ?? '—'} mono />
        <Row k="Transaction hash" v={d.txHash ?? 'not submitted'} mono />
        <div className="flex items-baseline justify-between gap-3 px-5 py-3 text-[14px]">
          <span className="shrink-0 text-[#78859A]">Expected recipient</span>
          {expectedNow === '' ? (
            <span className="text-right font-mono text-[12px] text-[#F2BF4A]">METHOD NOT CURRENTLY CONFIGURED</span>
          ) : recipientMatch ? (
            <span className="text-right font-mono text-[12px] text-[#35D98B]">matches current configuration</span>
          ) : (
            <span className="text-right font-mono text-[12px] text-[#F06B78]">DIFFERS from current configuration — investigate</span>
          )}
        </div>
      </SectionCard>
      <SectionCard title="Blockchain verification">
        <div className="px-5 py-4 text-[13px] leading-relaxed text-[#AAB5C7]">
          Check on the explorer: transaction exists, correct network, recipient is the configured deposit
          address above, correct asset/contract, amount matches, confirmations sufficient, and this TXID
          was never credited before.
        </div>
        {explorer ? (
          <div className="px-5 pb-4">
            <a href={explorer} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center rounded-[12px] border border-[#2A394D] px-5 text-[14px] font-bold text-white transition hover:border-[rgba(47,214,255,0.5)]">
              Open block explorer →
            </a>
          </div>
        ) : (
          <p className="px-5 pb-4 font-mono text-[12px] text-[#596579]">No explorer available (missing TXID or network).</p>
        )}
      </SectionCard>
      <SectionCard title="Admin action">
        <div className="p-5">
          <DepositActions id={d.id} status={d.status} />
        </div>
      </SectionCard>
    </div>
  );
}
