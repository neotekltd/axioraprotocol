import Link from 'next/link';
import { PageHeader, SectionCard, EmptyState, StatusBadge } from '@/components/data';
import { getAdminTickets, type TicketStatusFilter } from '@/lib/admin';
import { getDict } from '@/lib/i18n-server';
import { stWord } from '@/lib/i18n-dict';
import type { Dictionary } from '@/lib/i18n-dict';

export const metadata = { title: 'Admin support' };

function age(t: Dictionary['ops'], iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return '';
  const min = Math.floor(ms / 60000);
  if (min < 1) return t.agoJust;
  if (min < 60) return t.agoMin.replace('{n}', String(min));
  const h = Math.floor(min / 60);
  if (h < 48) return t.agoH.replace('{n}', String(h));
  return t.agoD.replace('{n}', String(Math.floor(h / 24)));
}

export default async function AdminSupport({ searchParams }: { searchParams?: { status?: string; q?: string } }) {
  const d = getDict();
  const TABS: { id: TicketStatusFilter; label: string }[] = [
    { id: 'open', label: stWord(d, 'open') },
    { id: 'answered', label: stWord(d, 'answered') },
    { id: 'closed', label: stWord(d, 'closed') },
    { id: 'all', label: d.common.all },
  ];
  const raw = searchParams?.status ?? 'open';
  const status: TicketStatusFilter = raw === 'answered' || raw === 'closed' || raw === 'all' ? raw : 'open';
  const q = (searchParams?.q ?? '').slice(0, 80);
  const rows = await getAdminTickets(status, q);
  const qs = (s: TicketStatusFilter) => `/admin/support?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
  return (
    <div>
      <PageHeader title={d.admin.tickets.title} sub={d.support.pageSub} />
      <form method="get" action="/admin/support" className="mt-6 flex gap-2">
        <input type="hidden" name="status" value={status} />
        <input
          name="q"
          defaultValue={q}
          placeholder={d.at.searchPh}
          maxLength={80}
          aria-label={d.at.searchAria}
          className="min-w-0 flex-1 rounded-[12px] border border-[#2A394D] bg-[#080B12] px-4 py-3 text-[14px] text-white outline-none transition placeholder:text-[#596579] focus:border-[#2FD6FF]"
        />
        <button type="submit" className="shrink-0 rounded-[12px] bg-[#2FD6FF] px-5 text-[14px] font-bold text-[#06121A] transition hover:brightness-110">
          {d.at.searchBtn}
        </button>
      </form>
      <div className="mt-3 grid grid-cols-4 gap-1 rounded-[16px] border border-[#202A3A] bg-[#0A0E16] p-1.5" role="navigation" aria-label={d.at.ticketFilter}>
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={qs(tab.id)}
            aria-current={status === tab.id ? 'page' : undefined}
            className={`flex min-h-[44px] items-center justify-center rounded-[11px] text-[13px] capitalize transition ${status === tab.id ? 'bg-[#1A2334] font-bold text-white' : 'text-[#78859A] hover:text-white'}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title={status === 'open' ? d.at.noOpen : d.at.noTicketsHere}
            body={status === 'open' ? d.ops.ticketsOk : d.admin.deposits.nothingWith.replace('{s}', stWord(d, status))}
          />
        </div>
      ) : (
        <SectionCard title={`${rows.length} · ${d.admin.tickets.title}`}>
          <ul className="divide-y divide-[#202A3A]/70">
            {rows.map((row) => {
              const lastUser = row.messages.filter((m) => !m.internal && m.sender === 'user').slice(-1)[0];
              const preview = lastUser?.body ?? row.opener;
              return (
                <li key={row.id}>
                  <Link href={`/admin/support/${row.id}`} className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#111722]/60">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[14px] font-bold text-white">{row.subject}</span>
                        {row.unread && (
                          <span className="rounded-full bg-[#2FD6FF] px-2 py-0.5 font-mono text-[10px] font-bold text-[#06121A]">{d.status.new}</span>
                        )}
                        <StatusBadge status={row.status} label={stWord(d, row.status)} />
                      </div>
                      <div className="mt-1 truncate text-[13px] text-[#AAB5C7]">{preview.slice(0, 120)}</div>
                      <div className="mt-1 truncate font-mono text-[11px] text-[#78859A]">
                        {row.userEmail ?? row.userId?.slice(0, 8) ?? 'no user'} · {row.category} · {row.messages.length} {row.messages.length === 1 ? d.at.replyN1.replace('{n}', '1') : d.at.repliesN.replace('{n}', String(row.messages.length))} · {age(d.ops, row.updatedAt)}
                      </div>
                    </div>
                    <span aria-hidden="true" className="shrink-0 font-mono text-[#2FD6FF]">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
