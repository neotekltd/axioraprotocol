'use client';

import { useState } from 'react';
import { PageHeader, SectionCard, EmptyState, StatusBadge } from '@/components/data';
import { AxButton, AxInput, AxSelect, AxTextarea, FieldError, FieldSuccess } from '@/components/ax/controls';
import { createSupportTicket } from '@/lib/actions';
import type { SupportTicket } from '@/lib/queries';
import { TicketThread } from '@/components/TicketThread';
import { useT } from '@/components/LanguageProvider';
import { PLANS, formatUSD } from '@/lib/plans';
import type { Dictionary } from '@/lib/i18n-dict';

const CATEGORIES = ['general', 'deposit', 'withdrawal', 'plans', 'referrals', 'security', 'other'] as const;

function catLabel(t: Dictionary['support'], c: string): string {
  if (c === 'deposit') return t.catDeposit;
  if (c === 'withdrawal') return t.catWithdrawal;
  if (c === 'plans') return t.catPlans;
  if (c === 'referrals') return t.catReferrals;
  if (c === 'security') return t.catSecurity;
  if (c === 'other') return t.catOther;
  return t.catGeneral;
}

function threadStatus(t: Dictionary['support'], status: string): { label: string; tone: 'pending' | 'processing' | 'completed' } {
  if (status === 'closed') return { label: t.resolved, tone: 'completed' };
  if (status === 'answered') return { label: t.waitingYou, tone: 'processing' };
  return { label: t.openSt, tone: 'pending' };
}

export function SupportView({ tickets }: { tickets: SupportTicket[] }) {
  const t = useT();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<string>('general');
  const [formOpen, setFormOpen] = useState(tickets.length === 0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const submit = async () => {
    setBusy(true);
    setResult(null);
    const res = await createSupportTicket({ subject, message, category });
    setBusy(false);
    setResult({ ok: res.ok, text: res.message });
    if (res.ok) {
      setSubject('');
      setMessage('');
      setCategory('general');
      setFormOpen(false);
    }
  };

  const minFaq = formatUSD(Math.min(...PLANS.map((p) => p.min)), { decimals: 0 });
  const rangesFaq = PLANS.map((p) => `${p.name} ${formatUSD(p.min, { decimals: 0 })}–${formatUSD(p.max, { decimals: 0 })}`).join(', ');
  const faqs = t.faqs.map((f) => ({ q: f.q, a: f.a.replace('{min}', minFaq).replace('{ranges}', rangesFaq) }));

  return (
    <div>
      <PageHeader
        title={t.support.title}
        sub={t.support.pageSub}
        actions={
          tickets.length > 0 ? (
            <button onClick={() => setFormOpen((v) => !v)} className="rounded-[12px] bg-[#2FD6FF] px-4 py-2.5 text-[14px] font-bold text-[#06121A] hover:brightness-110">
              {formOpen ? t.common.close : t.support.newTicket}
            </button>
          ) : undefined
        }
      />

      <SectionCard title={`${t.support.yourTickets} · ${tickets.length}`}>
        {tickets.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={t.support.empty}
              body={t.support.sub}
              actionLabel={t.support.openTicket}
              actionHref="#new-ticket"
            />
          </div>
        ) : (
          <ul className="divide-y divide-[#202A3A]/70">
            {tickets.map((ticket) => {
              const st = threadStatus(t.support, ticket.status);
              const expanded = openId === ticket.id;
              return (
                <li key={ticket.id}>
                  <button
                    onClick={() => setOpenId(expanded ? null : ticket.id)}
                    aria-expanded={expanded}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-[#111722]/60"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-white">{ticket.subject}</span>
                      <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#78859A]">
                        {catLabel(t.support, ticket.category)} · {ticket.createdAt.slice(0, 10)}
                      </span>
                    </span>
                    <StatusBadge status={ticket.status} label={st.label} />
                  </button>
                  <div className={`grid transition-all duration-300 ease-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="border-t border-[#202A3A]/60">
                        {expanded && (
                          <TicketThread ticketId={ticket.id} opener={ticket.message} openerAt={ticket.createdAt} closed={ticket.status === 'closed'} />
                        )}
                        <p className="px-5 pb-4 font-mono text-[11px] text-[#78859A]">{t.support.statusLine.replace('{status}', st.label.toUpperCase())}</p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {(formOpen || tickets.length === 0) && (
        <SectionCard title={t.support.ticketFormTitle}>
          <div className="space-y-4 p-5 sm:p-6" id="new-ticket">
            <div>
              <label htmlFor="ticket-subject" className="mb-2 block text-[14px] text-[#AAB5C7]">{t.support.subject}</label>
              <AxInput id="ticket-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t.support.howHelp} maxLength={120} />
            </div>
            <div className="sm:max-w-xs">
              <AxSelect id="ticket-category" label={t.support.category} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(t.support, c)}</option>)}
              </AxSelect>
            </div>
            <AxTextarea id="ticket-message" label={t.support.message} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.support.messagePh} maxLength={4000} />
            {result && (result.ok
              ? <FieldSuccess message={result.text} />
              : <FieldError message={result.text} />)}
            <div className="max-w-xs">
              <AxButton onClick={submit} disabled={busy}>
                {busy ? t.support.creatingTicket : t.support.createTicket}
              </AxButton>
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard title={t.support.faqTitle}>
        <div className="divide-y divide-[#202A3A]/70">
          {faqs.slice(0, 8).map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-[14px] font-semibold text-white hover:text-[#2FD6FF]"
              >
                {f.q}
                <span className="shrink-0 text-[#78859A]" aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <p className="px-5 pb-4 text-[14px] leading-relaxed text-[#AAB5C7]">{f.a}</p>}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
