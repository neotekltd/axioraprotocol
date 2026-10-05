import Link from 'next/link';
import { PageHeader, SectionCard, EmptyState, StatusBadge } from '@/components/data';
import { getAdminDeposits, isAutomaticDeposit, providerStatusOf, type DepositKind } from '@/lib/admin';
import { formatUSD } from '@/lib/finance';
import { getDict } from '@/lib/i18n-server';
import { stWord } from '@/lib/i18n-dict';

export const metadata = { title: 'Admin deposits' };

const TABS = ['pending', 'completed', 'rejected', 'all'] as const;

function short(h: string | null) {
  if (!h) return '—';
  return h.length > 18 ? `${h.slice(0, 10)}…${h.slice(-6)}` : h;
}

function TypeBadge({ provider, autoLbl, manualLbl }: { provider: string | null; autoLbl: string; manualLbl: string }) {
  const auto = isAutomaticDeposit(provider);
  return (
    <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.12em] ${
      auto
        ? 'border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]'
        : 'border-[rgba(242,191,74,0.4)] bg-[rgba(242,191,74,0.08)] text-[#F2BF4A]'
    }`}>
      {auto ? autoLbl : manualLbl}
    </span>
  );
}

export default async function AdminDeposits({ searchParams }: { searchParams?: { status?: string; kind?: string } }) {
  const t = getDict();
  const status = searchParams?.status ?? 'pending';
  const kind: DepositKind = searchParams?.kind === 'manual' || searchParams?.kind === 'automatic' || searchParams?.kind === 'review'
    ? searchParams.kind
    : 'all';
  const rows = await getAdminDeposits(status, kind);
  const qs = (s: string, k: DepositKind) => `/admin/deposits?status=${s}&kind=${k}`;
  const KINDS: { id: DepositKind; label: string }[] = [
    { id: 'all', label: t.admin.deposits.kindAll },
    { id: 'manual', label: t.admin.deposits.kindManual },
    { id: 'automatic', label: t.admin.deposits.kindAutomatic },
    { id: 'review', label: t.admin.deposits.kindReview },
  ];
  const tabLabel = (s: string) => (s === 'all' ? t.common.all : stWord(t, s));
  return (
    <div>
      <PageHeader title={t.admin.deposits.title} sub={t.admin.deposits.autoNote} />
      <div className="mt-6 grid grid-cols-4 gap-1 rounded-[16px] border border-[#202A3A] bg-[#0A0E16] p-1.5" role="navigation" aria-label={t.admin.deposits.filterStatus}>
        {TABS.map((s) => (
          <Link
            key={s}
            href={qs(s, kind)}
            aria-current={status === s ? 'page' : undefined}
            className={`flex min-h-[44px] items-center justify-center rounded-[11px] text-[13px] capitalize transition ${status === s ? 'bg-[#1A2334] font-bold text-white' : 'text-[#78859A] hover:text-white'}`}
          >
            {tabLabel(s)}
          </Link>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1 rounded-[16px] border border-[#202A3A] bg-[#0A0E16] p-1.5" role="navigation" aria-label={t.admin.deposits.filterKind}>
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
        <div className="mt-4"><EmptyState title={t.admin.deposits.empty} body={status === 'pending' ? t.admin.deposits.clearAll : t.admin.deposits.nothingWith.replace('{s}', stWord(t, status))} /></div>
      ) : (
        <SectionCard title={`${rows.length} · ${t.admin.deposits.title}`}>
          <ul className="divide-y divide-[#202A3A]/70">
            {rows.map((d) => (
              <li key={d.id}>
                <Link href={`/admin/deposits/${d.id}?kind=${kind}`} className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#111722]/60">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[14px] font-bold text-white">{formatUSD(d.amount)} {d.asset}</span>
                      <TypeBadge provider={d.provider} autoLbl={t.admin.deposits.typeAutomatic} manualLbl={t.admin.deposits.typeManual} />
                      <StatusBadge status={d.status} label={stWord(t, d.status)} />
                      {isAutomaticDeposit(d.provider) && providerStatusOf(d.meta) && (
                        <span className="font-mono text-[11px] text-[#78859A]">{stWord(t, providerStatusOf(d.meta) as string)}</span>
                      )}
                    </div>
                    <div dir="ltr" className="mt-1 truncate text-left font-mono text-[12px] text-[#78859A]">
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
