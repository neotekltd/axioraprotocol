import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader, SectionCard, StatusBadge } from '@/components/data';
import { TicketReplyForm, TicketStatusButtons } from '@/components/admin/tickets';
import { getAdminTicket, getAdminTicketContext } from '@/lib/admin';
import { formatUSD } from '@/lib/finance';

export const metadata = { title: 'Admin ticket' };

function Row({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#202A3A]/60 px-5 py-3 text-[14px] last:border-0">
      <span className="shrink-0 text-[#78859A]">{k}</span>
      <span className={`break-all text-right text-white ${mono ? 'font-mono text-[13px]' : ''}`}>{v}</span>
    </div>
  );
}

export default async function AdminTicketDetail({ params }: { params: { id: string } }) {
  const t = await getAdminTicket(params.id);
  if (!t) notFound();
  const ctx = await getAdminTicketContext(t.userId);
  const visible = t.messages.filter((m) => !m.internal);
  const notes = t.messages.filter((m) => m.internal);
  return (
    <div>
      <Link href="/admin/support?status=open" className="text-[14px] text-[#AAB5C7] hover:text-white">← Ticket queue</Link>
      <div className="mt-2">
        <PageHeader title={t.subject} sub={`${t.category} · opened ${t.createdAt.slice(0, 16).replace('T', ' ')}`} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={t.status} />
        {t.unread && <span className="rounded-full bg-[#2FD6FF] px-2 py-0.5 font-mono text-[10px] font-bold text-[#06121A]">NEW USER ACTIVITY</span>}
        <span className="font-mono text-[12px] text-[#78859A]">updated {t.updatedAt.slice(0, 16).replace('T', ' ')}</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <SectionCard title={`Conversation · ${visible.length + 1}`}>
            <ol className="space-y-3 px-5 py-5">
              <li className="max-w-[92%] rounded-[14px] border border-[#2A394D] bg-[#111722] p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-[#AAB5C7]">USER · OPENER</span>
                  <span className="font-mono text-[11px] text-[#78859A]">{t.createdAt.slice(0, 16).replace('T', ' ')}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-white">{t.opener}</p>
              </li>
              {visible.map((m) => (
                <li
                  key={m.id}
                  className={m.sender === 'admin'
                    ? 'ml-auto max-w-[92%] rounded-[14px] border border-[rgba(47,214,255,0.35)] bg-[rgba(47,214,255,0.07)] p-4'
                    : 'max-w-[92%] rounded-[14px] border border-[#2A394D] bg-[#111722] p-4'}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`font-mono text-[11px] font-bold tracking-[0.12em] ${m.sender === 'admin' ? 'text-[#2FD6FF]' : 'text-[#AAB5C7]'}`}>
                      {m.sender === 'admin' ? 'ADMIN' : 'USER'}
                    </span>
                    <span className="font-mono text-[11px] text-[#78859A]">{m.createdAt.slice(0, 16).replace('T', ' ')}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-white">{m.body}</p>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="Reply">
            <div className="px-5 py-5">
              <TicketReplyForm ticketId={t.id} />
            </div>
          </SectionCard>

          {notes.length > 0 && (
            <SectionCard title={`Internal notes · ${notes.length} (admin only)`}>
              <ol className="space-y-3 px-5 py-5">
                {notes.map((m) => (
                  <li key={m.id} className="rounded-[14px] border border-dashed border-[rgba(242,191,74,0.5)] bg-[rgba(242,191,74,0.05)] p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-[#F2BF4A]">INTERNAL NOTE</span>
                      <span className="font-mono text-[11px] text-[#78859A]">{m.createdAt.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-white">{m.body}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}

          <SectionCard title="Internal note">
            <div className="px-5 py-5">
              <TicketReplyForm ticketId={t.id} internal />
            </div>
          </SectionCard>
        </div>

        <div className="min-w-0 space-y-4">
          <SectionCard title="Ticket">
            <Row k="Status" v={t.status} />
            <Row k="Category" v={t.category} />
            <Row k="User" v={t.username ? `@${t.username}` : (t.userEmail ?? '—')} mono />
            <Row k="Email" v={t.userEmail ?? '—'} mono />
            <div className="px-5 py-4">
              <TicketStatusButtons ticketId={t.id} status={t.status} />
            </div>
          </SectionCard>

          <SectionCard title="User">
            <Row k="Email" v={ctx.email ?? '—'} mono />
            <Row k="Username" v={ctx.username ? `@${ctx.username}` : '—'} mono />
            <Row k="Since" v={ctx.since ?? '—'} mono />
          </SectionCard>

          <SectionCard title="Recent deposits">
            {ctx.recentDeposits.length === 0 ? (
              <p className="px-5 py-4 text-[13px] text-[#78859A]">No linked transaction.</p>
            ) : (
              <ul className="divide-y divide-[#202A3A]/60">
                {ctx.recentDeposits.map((d) => (
                  <li key={d.id} className="flex items-baseline justify-between gap-2 px-5 py-2.5 font-mono text-[12px]">
                    <span className="text-white">{formatUSD(d.amount)} {d.asset}</span>
                    <span className="text-[#78859A]">{d.provider === 'nowpayments' ? 'auto' : 'manual'} · {d.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Recent withdrawals">
            {ctx.recentWithdrawals.length === 0 ? (
              <p className="px-5 py-4 text-[13px] text-[#78859A]">No linked transaction.</p>
            ) : (
              <ul className="divide-y divide-[#202A3A]/60">
                {ctx.recentWithdrawals.map((d) => (
                  <li key={d.id} className="flex items-baseline justify-between gap-2 px-5 py-2.5 font-mono text-[12px]">
                    <span className="text-white">{formatUSD(d.amount)} {d.asset}</span>
                    <span className="text-[#78859A]">{d.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
