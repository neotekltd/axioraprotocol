import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader, SectionCard, StatusBadge } from '@/components/data';
import { TicketReplyForm, TicketStatusButtons } from '@/components/admin/tickets';
import { getAdminTicket, getAdminTicketContext } from '@/lib/admin';
import { formatUSD } from '@/lib/finance';
import { getDict } from '@/lib/i18n-server';
import { stWord } from '@/lib/i18n-dict';

export const metadata = { title: 'Admin ticket' };

function Row({ k, v, mono = false, ltr = false }: { k: string; v: string; mono?: boolean; ltr?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#202A3A]/60 px-5 py-3 text-[14px] last:border-0">
      <span className="shrink-0 text-[#78859A]">{k}</span>
      <span dir={ltr ? 'ltr' : undefined} className={`break-all text-right text-white ${mono ? 'font-mono text-[13px]' : ''}`}>{v}</span>
    </div>
  );
}

export default async function AdminTicketDetail({ params }: { params: { id: string } }) {
  const d = getDict();
  const t = await getAdminTicket(params.id);
  if (!t) notFound();
  const ctx = await getAdminTicketContext(t.userId);
  const visible = t.messages.filter((m) => !m.internal);
  const notes = t.messages.filter((m) => m.internal);
  return (
    <div>
      <Link href="/admin/support?status=open" className="text-[14px] text-[#AAB5C7] hover:text-white">← {d.at.queueBack}</Link>
      <div className="mt-2">
        <PageHeader title={t.subject} sub={`${t.category} · ${d.at.openedAt.replace('{d}', t.createdAt.slice(0, 16).replace('T', ' '))}`} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={t.status} label={stWord(d, t.status)} />
        {t.unread && <span className="rounded-full bg-[#2FD6FF] px-2 py-0.5 font-mono text-[10px] font-bold text-[#06121A]">{d.at.newActivity}</span>}
        <span className="font-mono text-[12px] text-[#78859A]">{d.at.updated.replace('{d}', t.updatedAt.slice(0, 16).replace('T', ' '))}</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <SectionCard title={`${d.at.conversation} · ${visible.length + 1}`}>
            <ol className="space-y-3 px-5 py-5">
              <li className="max-w-[92%] rounded-[14px] border border-[#2A394D] bg-[#111722] p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-[#AAB5C7]">{d.at.userOpener}</span>
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
                      {m.sender === 'admin' ? d.at.adminLbl : d.at.userLbl}
                    </span>
                    <span className="font-mono text-[11px] text-[#78859A]">{m.createdAt.slice(0, 16).replace('T', ' ')}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-white">{m.body}</p>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title={d.at.replySec}>
            <div className="px-5 py-5">
              <TicketReplyForm ticketId={t.id} />
            </div>
          </SectionCard>

          {notes.length > 0 && (
            <SectionCard title={d.at.notesSec.replace('{n}', String(notes.length))}>
              <ol className="space-y-3 px-5 py-5">
                {notes.map((m) => (
                  <li key={m.id} className="rounded-[14px] border border-dashed border-[rgba(242,191,74,0.5)] bg-[rgba(242,191,74,0.05)] p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-[#F2BF4A]">{d.at.internalNote}</span>
                      <span className="font-mono text-[11px] text-[#78859A]">{m.createdAt.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-white">{m.body}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}

          <SectionCard title={d.at.noteSec}>
            <div className="px-5 py-5">
              <TicketReplyForm ticketId={t.id} internal />
            </div>
          </SectionCard>
        </div>

        <div className="min-w-0 space-y-4">
          <SectionCard title={d.at.ticketSec}>
            <Row k={d.at.statusR} v={stWord(d, t.status)} />
            <Row k={d.at.categoryR} v={t.category} />
            <Row k={d.at.userR} v={t.username ? `@${t.username}` : (t.userEmail ?? '—')} mono ltr />
            <Row k={d.at.emailR} v={t.userEmail ?? '—'} mono ltr />
            <div className="px-5 py-4">
              <TicketStatusButtons ticketId={t.id} status={t.status} />
            </div>
          </SectionCard>

          <SectionCard title={d.at.userSec}>
            <Row k={d.at.emailR} v={ctx.email ?? '—'} mono ltr />
            <Row k={d.profile.username} v={ctx.username ? `@${ctx.username}` : '—'} mono ltr />
            <Row k={d.at.sinceR} v={ctx.since ?? '—'} mono ltr />
          </SectionCard>

          <SectionCard title={d.at.recentDep}>
            {ctx.recentDeposits.length === 0 ? (
              <p className="px-5 py-4 text-[13px] text-[#78859A]">{d.at.noLinked}</p>
            ) : (
              <ul className="divide-y divide-[#202A3A]/60">
                {ctx.recentDeposits.map((dep) => (
                  <li key={dep.id} className="flex items-baseline justify-between gap-2 px-5 py-2.5 font-mono text-[12px]">
                    <span className="text-white">{formatUSD(dep.amount)} {dep.asset}</span>
                    <span className="text-[#78859A]">{dep.provider === 'nowpayments' ? d.at.autoW : d.at.manualW} · {stWord(d, dep.status)}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title={d.at.recentWd}>
            {ctx.recentWithdrawals.length === 0 ? (
              <p className="px-5 py-4 text-[13px] text-[#78859A]">{d.at.noLinked}</p>
            ) : (
              <ul className="divide-y divide-[#202A3A]/60">
                {ctx.recentWithdrawals.map((wd) => (
                  <li key={wd.id} className="flex items-baseline justify-between gap-2 px-5 py-2.5 font-mono text-[12px]">
                    <span className="text-white">{formatUSD(wd.amount)} {wd.asset}</span>
                    <span className="text-[#78859A]">{stWord(d, wd.status)}</span>
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
