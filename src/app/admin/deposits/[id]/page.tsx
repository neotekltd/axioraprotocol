import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader, SectionCard, StatusBadge } from '@/components/data';
import { DepositActions } from '@/components/admin/forms';
import { depositNeedsReview, getAdminDeposits, isAutomaticDeposit, providerStatusOf } from '@/lib/admin';
import { getDepositAddress } from '@/lib/deposits';
import { formatUSD } from '@/lib/finance';
import { getDict } from '@/lib/i18n-server';
import { stWord } from '@/lib/i18n-dict';

export const metadata = { title: 'Admin deposit review' };

const EXPLORERS: Record<string, (tx: string) => string> = {
  TRON: (tx) => `https://tronscan.org/#/transaction/${tx}`,
  Ethereum: (tx) => `https://etherscan.io/tx/${tx}`,
  'BNB Smart Chain': (tx) => `https://bscscan.com/tx/${tx}`,
  Bitcoin: (tx) => `https://mempool.space/tx/${tx}`,
  Litecoin: (tx) => `https://litecoinspace.org/tx/${tx}`,
  Dogecoin: (tx) => `https://dogecha.in/tx/${tx}`,
};

function Row({ k, v, mono = false, ltr = false }: { k: string; v: string; mono?: boolean; ltr?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#202A3A]/60 px-5 py-3 text-[14px] last:border-0">
      <span className="shrink-0 text-[#78859A]">{k}</span>
      <span dir={ltr ? 'ltr' : undefined} className={`break-all text-right text-white ${mono ? 'font-mono text-[13px]' : ''}`}>{v}</span>
    </div>
  );
}

export default async function AdminDepositReview({ params }: { params: { id: string } }) {
  const t = getDict();
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
  const automatic = isAutomaticDeposit(d.provider);
  const pStatus = providerStatusOf(d.meta);
  const needsReview = depositNeedsReview(d.meta, pStatus);
  const metaStr = (k: string) => {
    const v = d.meta[k];
    if (typeof v === 'string' && v.length > 0) return v;
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
    return null;
  };
  const paymentId = d.providerRef;
  return (
    <div>
      <Link href="/admin/deposits?status=pending" className="text-[14px] text-[#AAB5C7] hover:text-white">← {t.rev.backQueue}</Link>
      <div className="mt-2">
        <PageHeader title={`${t.rev.secDeposit} ${d.id.slice(0, 8)}`} sub={t.rev.reviewSub} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.12em] ${
          automatic
            ? 'border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]'
            : 'border-[rgba(242,191,74,0.4)] bg-[rgba(242,191,74,0.08)] text-[#F2BF4A]'
        }`}>
          {automatic ? t.rev.autoBadge : t.rev.manualBadge}
        </span>
        <StatusBadge status={d.status} label={stWord(t, d.status)} />
        <span className="font-mono text-[13px] text-[#78859A]">{d.createdAt.slice(0, 16).replace('T', ' ')}</span>
      </div>
      <SectionCard title={t.rev.secDeposit}>
        <Row k={t.rev.depositId} v={d.id} mono ltr />
        <Row k={t.rev.user} v={d.userEmail ?? d.userId} mono ltr />
        <Row k={t.rev.asset} v={`${d.amount.toFixed(2)} ${d.asset}`} mono ltr />
        <Row k={t.rev.network} v={`${d.network ?? '—'}${standard ? ` (${standard})` : ''}`} />
        <Row k={t.rev.claimed} v={formatUSD(d.amount)} />
        <Row k={t.rev.depAddr} v={d.address ?? '—'} mono ltr />
        <Row k={t.rev.txHash} v={d.txHash ?? t.rev.notSubmitted} mono ltr />
        <div className="flex items-baseline justify-between gap-3 px-5 py-3 text-[14px]">
          <span className="shrink-0 text-[#78859A]">{t.rev.expected}</span>
          {expectedNow === '' ? (
            <span className="text-right font-mono text-[12px] text-[#F2BF4A]">{t.rev.methodOff2}</span>
          ) : recipientMatch ? (
            <span className="text-right font-mono text-[12px] text-[#35D98B]">{t.rev.matches}</span>
          ) : (
            <span className="text-right font-mono text-[12px] text-[#F06B78]">{t.rev.differs}</span>
          )}
        </div>
      </SectionCard>
      {automatic && (
        <SectionCard title={t.rev.provSec}>
          <Row k={t.rev.rail} v={t.rev.railAuto} />
          {paymentId && <Row k={t.rev.payId} v={paymentId} mono ltr />}
          {typeof d.meta.order_id === 'string' && d.meta.order_id.length > 0 && <Row k={t.rev.orderId} v={d.meta.order_id} mono ltr />}
          {pStatus && <Row k={t.rev.provStatus} v={stWord(t, pStatus)} mono />}
          {metaStr('pay_currency') && <Row k={t.rev.payCur} v={String(metaStr('pay_currency')).toUpperCase()} mono ltr />}
          {metaStr('pay_amount') && <Row k={t.rev.payAmt} v={metaStr('pay_amount') as string} mono ltr />}
          {needsReview && <Row k={t.rev.attention} v={t.rev.flagged} />}
          {!needsReview && d.status === 'pending' && <Row k={t.rev.attention} v={t.rev.inflight} />}
        </SectionCard>
      )}
      <SectionCard title={t.rev.chainSec}>
        <div className="px-5 py-4 text-[13px] leading-relaxed text-[#AAB5C7]">
          {t.rev.chainBody}
        </div>
        {explorer ? (
          <div className="px-5 pb-4">
            <a href={explorer} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center rounded-[12px] border border-[#2A394D] px-5 text-[14px] font-bold text-white transition hover:border-[rgba(47,214,255,0.5)]">
              {t.rev.openExplorer} →
            </a>
          </div>
        ) : (
          <p className="px-5 pb-4 font-mono text-[12px] text-[#596579]">{t.rev.noExplorer}</p>
        )}
      </SectionCard>
      <SectionCard title={t.rev.actSec}>
        <div className="p-5">
          <DepositActions id={d.id} status={d.status} provider={d.provider} needsReview={needsReview} />
        </div>
      </SectionCard>
    </div>
  );
}
