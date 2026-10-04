import Link from 'next/link';
import { PageHeader, SectionCard, EmptyState, StatusBadge } from '@/components/data';
import { getAdminDeposits, isAutomaticDeposit, providerStatusOf, type DepositKind } from '@/lib/admin';
import { formatUSD } from '@/lib/finance';

export const metadata = { title: 'Admin deposits' };

const TABS = ['pending', 'completed', 'rejected', 'all'] as const;
const KINDS: { id: DepositKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'manual', label: 'Manual' },
  { id: 'automatic', label: 'Automatic' },
  { id: 'review', label: 'Needs review' },
];

function short(h: string | null) {
  if (!h) return '—';
  return h.length > 18 ? `${h.slice(0, 10)}…${h.slice(-6)}` : h;
}

function TypeBadge({ provider }: { provider: string | null }) {
  const auto = isAutomaticDeposit(provider);
  return (
    <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.12em] ${
      auto
        ? 'border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]'
        : 'border-[rgba(242,191,74,0.4)] bg-[rgba(242,191,74,0.08)] text-[#F2BF4A]'
    }`}>
      {auto ? 'AUTOMATIC' : 'MANUAL'}
    </span>
  );
}

export default async function AdminDeposits({ searchParams }: { searchParams?: { status?: string; kind?: string } }) {
  const status = searchParams?.status ?? 'pending';
  const kind: DepositKind = searchParams?.kind === 'manual' || searchParams?.kind === 'automatic' || searchParams?.kind === 'review'
    ? searchParams.kind
    : 'all';
  const rows = await getAdminDeposits(status, kind);
  const qs = (s: string, k: DepositKind) => `/admin/deposits?status=${s}&kind=${k}`;
  return (
    <div>
      <PageHeader title="Deposits" sub="Manual deposits need review. Automatic provider deposits credit themselves — only exceptions need attention." />
      <div className="mt-6 grid grid-cols-4 gap-1 rounded-[16px] border border-[#202A3A] bg-[#0A0E16] p-1.5" role="navigation" aria-label="Deposit status filter">
        {TABS.map((t) => (
          <Link
            key={t}
            href={qs(t, kind)}
            aria-current={status === t ? 'page' : undefined}
            className={`flex min-h-[44px] items-center justify-center rounded-[11px] text-[13px] capitalize transition ${status === t ? 'bg-[#1A2334] font-bold text-white' : 'text-[#78859A] hover:text-white'}`}
          >
            {t}
          </Link>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1 rounded-[16px] border border-[#202A3A] bg-[#0A0E16] p-1.5" role="navigation" aria-label="Deposit rail filter">
        {KINDS.map(({ id, label }) => (
          <Link
            key={id}
            href={qs(status, id)}
            aria-current={kind === id ? 'page' : undefined}
            className={`flex min-h-[44px] items-center justify-center rounded-[11px] text-[13px] transition ${kind === id ? 'bg-[#1A2334] font-bold text-white' : 'text-[#78859A] hover:text-white'}`}
          >
            {label}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="mt-4"><EmptyState title="No deposits here" body={status === 'pending' ? 'All deposit reviews are clear.' : `Nothing with status ${status}.`} /></div>
      ) : (
        <SectionCard title={`${rows.length} deposit${rows.length === 1 ? '' : 's'}`}>
          <ul className="divide-y divide-[#202A3A]/70">
            {rows.map((d) => (
              <li key={d.id}>
                <Link href={`/admin/deposits/${d.id}?kind=${kind}`} className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#111722]/60">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[14px] font-bold text-white">{formatUSD(d.amount)} {d.asset}</span>
                      <TypeBadge provider={d.provider} />
                      <StatusBadge status={d.status} />
                      {isAutomaticDeposit(d.provider) && providerStatusOf(d.meta) && (
                        <span className="font-mono text-[11px] text-[#78859A]">{providerStatusOf(d.meta)}</span>
                      )}
                    </div>
                    <div className="mt-1 truncate font-mono text-[12px] text-[#78859A]">
                      {d.userEmail ?? d.userId.slice(0, 8)} · {d.network ?? '—'} · TX {short(d.txHash)} · {d.createdAt.slice(0, 16).replace('T', ' ')}
                    </div>
                  </div>
                  <span aria-hidden="true" className="shrink-0 font-mono text-[#2FD6FF]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
