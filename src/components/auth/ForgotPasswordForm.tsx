'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const input = 'w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse';

export function ForgotPasswordForm() {
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
        <div className="font-bold">Check your inbox</div>
        <p className="mt-2 text-sm text-fog">If an account exists for {email.trim()}, a password-reset link is on its way. It expires shortly and can only be used once.</p>
        <Link href="/login" className="mt-5 inline-block text-sm text-pulse">Return to login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="reset-email" className="text-xs text-fog">Email</label>
        <input
          id="reset-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false}
          className={`mt-1 ${input}`}
        />
      </div>
      {state === 'error' && <p role="alert" className="text-xs text-danger">Could not send the reset email. Check the address and your connection, then try again.</p>}
      <button disabled={busy} className="w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black disabled:opacity-60">
        {busy ? 'Sending…' : 'Send reset link'}
      </button>
      <p className="text-center text-xs text-fog"><Link href="/login" className="text-pulse">Return to login</Link></p>
    </form>
  );
}
