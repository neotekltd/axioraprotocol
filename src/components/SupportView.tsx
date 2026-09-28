'use client';

import { useState } from 'react';
import { PageHeader, SectionCard } from '@/components/data';
import { FAQS } from '@/lib/mock';
import { createSupportTicket } from '@/lib/actions';

const input = 'mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse';

export function SupportView() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const submit = async () => {
    setBusy(true);
    setResult(null);
    const res = await createSupportTicket({ subject, message });
    setBusy(false);
    setResult({ ok: res.ok, text: res.message });
    if (res.ok) {
      setSubject('');
      setMessage('');
    }
  };

  return (
    <div>
      <PageHeader title="Support" sub="Answers first, humans when needed." />
      <SectionCard title="Frequently asked questions">
        <div className="divide-y divide-line">
          {FAQS.slice(0, 8).map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold hover:text-pulse"
              >
                {f.q}
                <span className="text-fog" aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <p className="px-5 pb-4 text-sm text-fog">{f.a}</p>}
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Open a ticket">
        <div className="p-5 sm:p-6">
          <label htmlFor="ticket-subject" className="text-xs text-fog">Subject</label>
          <input id="ticket-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" className={input} maxLength={120} />
          <label htmlFor="ticket-message" className="mt-4 block text-xs text-fog">Message</label>
          <textarea id="ticket-message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the issue, including what you expected and what happened." className={input} maxLength={4000} />
          {result && <p role={result.ok ? 'status' : 'alert'} className={`mt-3 text-xs ${result.ok ? 'text-pulse' : 'text-danger'}`}>{result.text}</p>}
          <button onClick={submit} disabled={busy} className="mt-4 rounded-xl bg-pulse px-6 py-2.5 text-sm font-bold text-black disabled:opacity-60 hover:brightness-110">
            {busy ? 'Opening…' : 'Open ticket'}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
