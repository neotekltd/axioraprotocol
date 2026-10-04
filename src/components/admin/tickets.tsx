'use client';

// Admin ticket interactives: reply composer (idempotent per mount-key) and
// status transitions. Every mutation runs server-side + audited; the typed
// text survives failures and duplicate submits converge to one message.
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxButton, FieldError, FieldSuccess } from '@/components/ax/controls';
import { replyToTicket, setTicketStatus } from '@/lib/admin-actions';

function mountKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `k-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  }
}

export function TicketReplyForm({ ticketId, internal = false }: { ticketId: string; internal?: boolean }) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const keyRef = useRef<string | null>(null);
  if (keyRef.current === null) keyRef.current = mountKey();
  const router = useRouter();

  const send = async () => {
    const text = body.trim();
    if (text.length === 0 || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await replyToTicket({ ticketId, body: text, key: keyRef.current as string, internal });
      setResult({ ok: r.ok, text: r.message });
      if (r.ok) {
        setBody('');
        keyRef.current = mountKey();
        router.refresh();
      }
    } catch {
      setResult({ ok: false, text: 'Could not send. Your text is kept — try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label htmlFor={internal ? 'ticket-note' : 'ticket-reply'} className="mb-2 block text-[13px] font-semibold text-white">
        {internal ? 'Internal note — never shown to the user' : 'Reply to user'}
      </label>
      <textarea
        id={internal ? 'ticket-note' : 'ticket-reply'}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={4000}
        disabled={busy}
        placeholder={internal ? 'Note for admins only…' : 'Write a reply…'}
        className={`w-full rounded-[12px] border bg-[#080B12] px-4 py-3.5 text-[14px] leading-relaxed text-white outline-none transition placeholder:text-[#596579] focus:border-[#2FD6FF] disabled:opacity-60 ${
          internal ? 'border-dashed border-[rgba(242,191,74,0.5)]' : 'border-[#2A394D]'
        }`}
      />
      {result && (
        <div className="mt-2">
          {result.ok ? <FieldSuccess message={result.text} /> : <FieldError message={result.text} />}
        </div>
      )}
      <div className="mt-3 max-w-xs">
        <AxButton disabled={busy || body.trim().length === 0} onClick={() => void send()}>
          {busy ? 'Sending…' : internal ? 'Save internal note' : 'Send reply'}
        </AxButton>
      </div>
    </div>
  );
}

const NEXT: Record<string, { to: 'open' | 'answered' | 'closed'; label: string }[]> = {
  open: [
    { to: 'answered', label: 'Mark answered' },
    { to: 'closed', label: 'Close ticket' },
  ],
  answered: [
    { to: 'open', label: 'Reopen' },
    { to: 'closed', label: 'Close ticket' },
  ],
  closed: [{ to: 'open', label: 'Reopen ticket' }],
};

export function TicketStatusButtons({ ticketId, status }: { ticketId: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const options = NEXT[status] ?? NEXT.open;

  const change = async (to: 'open' | 'answered' | 'closed') => {
    setBusy(true);
    setError(null);
    try {
      const r = await setTicketStatus({ ticketId, to });
      if (!r.ok) setError(r.message);
      router.refresh();
    } catch {
      setError('Could not change the ticket status.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map(({ to, label }) => (
          <button
            key={to}
            type="button"
            disabled={busy}
            onClick={() => void change(to)}
            className="min-h-[44px] rounded-[12px] border border-[#2A394D] bg-[#111722] px-4 text-[13px] font-bold text-white transition hover:border-[rgba(47,214,255,0.5)] disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-[13px] font-semibold text-[#F2BF4A]">{error}</p>}
    </div>
  );
}
