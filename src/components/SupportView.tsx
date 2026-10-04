'use client';

import { useState } from 'react';
import { PageHeader, SectionCard, EmptyState, StatusBadge } from '@/components/data';
import { AxButton, AxInput, AxSelect, AxTextarea, FieldError, FieldSuccess } from '@/components/ax/controls';
import { FAQS } from '@/lib/mock';
import { createSupportTicket } from '@/lib/actions';
import type { SupportTicket } from '@/lib/queries';
import { TicketThread } from '@/components/TicketThread';

const CATEGORIES = ['general', 'deposit', 'withdrawal', 'plans', 'referrals', 'security', 'other'] as const;

function threadStatus(status: string): { label: string; tone: 'pending' | 'processing' | 'completed' } {
  if (status === 'closed') return { label: 'Resolved', tone: 'completed' };
  if (status === 'answered') return { label: 'Waiting for you', tone: 'processing' };
  return { label: 'Open', tone: 'pending' };
}

export function SupportView({ tickets }: { tickets: SupportTicket[] }) {
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

  return (
    <div>
      <PageHeader
        title="Support"
        sub="Ask about deposits, plans, payouts and your account."
        actions={
          tickets.length > 0 ? (
            <button onClick={() => setFormOpen((v) => !v)} className="rounded-[12px] bg-[#2FD6FF] px-4 py-2.5 text-[14px] font-bold text-[#06121A] hover:brightness-110">
              {formOpen ? 'Close' : 'New ticket'}
            </button>
          ) : undefined
        }
      />

      <SectionCard title={`Your tickets · ${tickets.length}`}>
        {tickets.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No tickets yet"
              body="Open a ticket below and the conversation lives here with its current status."
              actionLabel="Open a ticket"
              actionHref="#new-ticket"
            />
          </div>
        ) : (
          <ul className="divide-y divide-[#202A3A]/70">
            {tickets.map((t) => {
              const st = threadStatus(t.status);
              const expanded = openId === t.id;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setOpenId(expanded ? null : t.id)}
                    aria-expanded={expanded}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-[#111722]/60"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-white">{t.subject}</span>
                      <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#78859A]">
                        {t.category} · {t.createdAt.slice(0, 10)}
                      </span>
                    </span>
                    <StatusBadge status={st.label} />
                  </button>
                  <div className={`grid transition-all duration-300 ease-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="border-t border-[#202A3A]/60">
                        {expanded && (
                          <TicketThread ticketId={t.id} opener={t.message} openerAt={t.createdAt} closed={t.status === 'closed'} />
                        )}
                        <p className="px-5 pb-4 font-mono text-[11px] text-[#78859A]">STATUS: {st.label.toUpperCase()} — replies arrive by email.</p>
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
        <SectionCard title="Open a ticket">
          <div className="space-y-4 p-5 sm:p-6" id="new-ticket">
            <div>
              <label htmlFor="ticket-subject" className="mb-2 block text-[14px] text-[#AAB5C7]">Subject</label>
              <AxInput id="ticket-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" maxLength={120} />
            </div>
            <div className="sm:max-w-xs">
              <AxSelect id="ticket-category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
              </AxSelect>
            </div>
            <AxTextarea id="ticket-message" label="Message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the issue, including what you expected and what happened." maxLength={4000} />
            {result && (result.ok
              ? <FieldSuccess message={result.text} />
              : <FieldError message={result.text} />)}
            <div className="max-w-xs">
              <AxButton onClick={submit} disabled={busy}>
                {busy ? 'Creating…' : 'Create ticket'}
              </AxButton>
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Frequently asked questions">
        <div className="divide-y divide-[#202A3A]/70">
          {FAQS.slice(0, 8).map((f, i) => (
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
