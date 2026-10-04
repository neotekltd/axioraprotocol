import Link from 'next/link';
import { PageHeader, SectionCard, EmptyState, StatusBadge } from '@/components/data';
import { getAdminTickets, type TicketStatusFilter } from '@/lib/admin';

export const metadata = { title: 'Admin support' };

const TABS: { id: TicketStatusFilter; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'answered', label: 'Answered' },
  { id: 'closed', label: 'Closed' },
  { id: 'all', label: 'All' },
];

function age(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return '';
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function AdminSupport({ searchParams }: { searchParams?: { status?: string; q?: string } }) {
  const raw = searchParams?.status ?? 'open';
  const status: TicketStatusFilter = raw === 'answered' || raw === 'closed' || raw === 'all' ? raw : 'open';
  const q = (searchParams?.q ?? '').slice(0, 80);
  const rows = await getAdminTickets(status, q);
  const qs = (s: TicketStatusFilter) => `/admin/support?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
  return (
    <div>
      <PageHeader title="Support" sub="Open a ticket, read the conversation, reply, and resolve — without leaving admin." />
      <form method="get" action="/admin/support" className="mt-6 flex gap-2">
        <input type="hidden" name="status" value={status} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search subject, message, user…"
          maxLength={80}
          aria-label="Search tickets"
          className="min-w-0 flex-1 rounded-[12px] border border-[#2A394D] bg-[#080B12] px-4 py-3 text-[14px] text-white outline-none transition placeholder:text-[#596579] focus:border-[#2FD6FF]"
        />
        <button type="submit" className="shrink-0 rounded-[12px] bg-[#2FD6FF] px-5 text-[14px] font-bold text-[#06121A] transition hover:brightness-110">
          Search
        </button>
      </form>
      <div className="mt-3 grid grid-cols-4 gap-1 rounded-[16px] border border-[#202A3A] bg-[#0A0E16] p-1.5" role="navigation" aria-label="Ticket status filter">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={qs(t.id)}
            aria-current={status === t.id ? 'page' : undefined}
            className={`flex min-h-[44px] items-center justify-center rounded-[11px] text-[13px] capitalize transition ${status === t.id ? 'bg-[#1A2334] font-bold text-white' : 'text-[#78859A] hover:text-white'}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title={status === 'open' ? 'No open tickets' : 'No tickets here'}
            body={status === 'open' ? 'All support requests are up to date.' : `Nothing with status ${status}.`}
          />
        </div>
      ) : (
        <SectionCard title={`${rows.length} ticket${rows.length === 1 ? '' : 's'}`}>
          <ul className="divide-y divide-[#202A3A]/70">
            {rows.map((t) => {
              const lastUser = t.messages.filter((m) => !m.internal && m.sender === 'user').slice(-1)[0];
              const preview = lastUser?.body ?? t.opener;
              return (
                <li key={t.id}>
                  <Link href={`/admin/support/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#111722]/60">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[14px] font-bold text-white">{t.subject}</span>
                        {t.unread && (
                          <span className="rounded-full bg-[#2FD6FF] px-2 py-0.5 font-mono text-[10px] font-bold text-[#06121A]">NEW</span>
                        )}
                        <StatusBadge status={t.status} />
                      </div>
                      <div className="mt-1 truncate text-[13px] text-[#AAB5C7]">{preview.slice(0, 120)}</div>
                      <div className="mt-1 truncate font-mono text-[11px] text-[#78859A]">
                        {t.userEmail ?? t.userId?.slice(0, 8) ?? 'no user'} · {t.category} · {t.messages.length} repl{t.messages.length === 1 ? 'y' : 'ies'} · {age(t.updatedAt)}
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
