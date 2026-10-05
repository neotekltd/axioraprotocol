'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useT } from '@/components/LanguageProvider';

const input = 'w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse';

export function ForgotPasswordForm() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setState('idle');
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setState(error ? 'error' : 'sent');
    } catch {
      setState('error');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'sent') {
    return (
      <div className="text-center">
        <div className="font-bold">{t.auth.checkInbox}</div>
        <p className="mt-2 text-sm text-fog">{t.auth.resetSent.replace('{email}', email.trim())}</p>
        <Link href="/login" className="mt-5 inline-block text-sm text-pulse">{t.auth.returnLogin}</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="reset-email" className="text-xs text-fog">{t.auth.emailLabel}</label>
        <input
          id="reset-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={t.auth.emailPlaceholder} autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false}
          dir="ltr"
          className={`mt-1 ${input}`}
        />
      </div>
      {state === 'error' && <p role="alert" className="text-xs text-danger">{t.auth.sendFailed}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black disabled:opacity-60">
        {busy ? t.auth.sending : t.auth.sendLink}
      </button>
      <p className="text-center text-xs text-fog"><Link href="/login" className="text-pulse">{t.auth.returnLogin}</Link></p>
    </form>
  );
}
