'use client';

// Authenticated user view of one support ticket: opener + admin replies and
// a reply composer. A user reply reopens the ticket so it returns to the
// admin queue. Idempotent per mount-key; typed text survives failures.
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxButton, FieldError, FieldSuccess } from '@/components/ax/controls';
import { getMyTicketMessages, replyToSupportTicket, type TicketMessage } from '@/lib/actions';
import { useT } from '@/components/LanguageProvider';

function mountKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `k-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  }
}

export function TicketThread({ ticketId, opener, openerAt, closed }: {
  ticketId: string; opener: string; openerAt: string; closed: boolean;
}) {
  const [messages, setMessages] = useState<TicketMessage[] | null>(null);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const t = useT();
  const keyRef = useRef<string | null>(null);
  if (keyRef.current === null) keyRef.current = mountKey();
  const router = useRouter();

  useEffect(() => {
    let live = true;
    void getMyTicketMessages(ticketId).then((rows) => {
      if (live) setMessages(rows);
    });
    return () => {
      live = false;
    };
  }, [ticketId]);

  const send = async () => {
    const text = body.trim();
    if (text.length === 0 || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await replyToSupportTicket({ ticketId, body: text, key: keyRef.current as string });
      setResult({ ok: r.ok, text: r.message });
      if (r.ok) {
        setBody('');
        keyRef.current = mountKey();
        const rows = await getMyTicketMessages(ticketId);
        setMessages(rows);
        router.refresh();
      }
    } catch {
      setResult({ ok: false, text: t.acts.replySendFail });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-[#202A3A]/60 px-5 py-4">
      <ol className="space-y-2.5">
        <li className="rounded-[12px] border border-[#2A394D] bg-[#111722] p-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-[#AAB5C7]">{t.support.youOpener}</span>
            <span className="font-mono text-[11px] text-[#78859A]">{openerAt.slice(0, 16).replace('T', ' ')}</span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-white">{opener}</p>
        </li>
        {(messages ?? []).map((m) => (
          <li
            key={m.id}
            className={m.sender === 'admin'
              ? 'ml-auto max-w-[94%] rounded-[12px] border border-[rgba(47,214,255,0.35)] bg-[rgba(47,214,255,0.07)] p-3.5'
              : 'max-w-[94%] rounded-[12px] border border-[#2A394D] bg-[#111722] p-3.5'}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className={`font-mono text-[10px] font-bold tracking-[0.12em] ${m.sender === 'admin' ? 'text-[#2FD6FF]' : 'text-[#AAB5C7]'}`}>
                {m.sender === 'admin' ? t.support.supportLbl : t.support.youLbl}
              </span>
              <span className="font-mono text-[11px] text-[#78859A]">{m.createdAt.slice(0, 16).replace('T', ' ')}</span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-white">{m.body}</p>
          </li>
        ))}
      </ol>
      {closed ? (
        <p className="mt-3 text-[13px] text-[#78859A]">{t.support.resolvedReopen}</p>
      ) : null}
      <label htmlFor={`reply-${ticketId}`} className="mb-2 mt-4 block text-[13px] font-semibold text-white">
        {closed ? t.support.replyReopen : t.support.replyLbl}
      </label>
      <textarea
        id={`reply-${ticketId}`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={4000}
        disabled={busy}
        placeholder={t.support.replyPh}
        className="w-full rounded-[12px] border border-[#2A394D] bg-[#080B12] px-4 py-3 text-[14px] leading-relaxed text-white outline-none transition placeholder:text-[#596579] focus:border-[#2FD6FF] disabled:opacity-60"
      />
      {result && (
        <div className="mt-2">
          {result.ok ? <FieldSuccess message={result.text} /> : <FieldError message={result.text} />}
        </div>
      )}
      <div className="mt-3 max-w-xs">
        <AxButton disabled={busy || body.trim().length === 0} onClick={() => void send()}>
          {busy ? t.support.sending : t.support.sendReply}
        </AxButton>
      </div>
    </div>
  );
}
