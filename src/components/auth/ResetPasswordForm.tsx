'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const input = 'mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // Supabase restores the recovery session from the link automatically;
      // updateUser applies the new password to that session. No token is shown.
      const { error } = await createClient().auth.updateUser({ password });
      if (error) {
        setError(
          error.message.toLowerCase().includes('session') || error.message.toLowerCase().includes('token')
            ? 'This reset link is invalid or expired. Request a new one.'
            : error.message
        );
        return;
      }
      setDone(true);
    } catch {
      setError('Could not update the password. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="font-bold">Password updated</div>
        <p className="mt-2 text-sm text-fog">Sign in with your new password.</p>
        <Link href="/login" className="mt-5 inline-block rounded-xl bg-pulse px-6 py-2.5 text-sm font-bold text-black">Sign in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="new-password" className="text-xs text-fog">New password (min. 8 characters)</label>
        <div className="relative mt-1">
          <input
            id="new-password" required minLength={8} type={show ? 'text' : 'password'} value={password}
            onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
            className="w-full rounded-xl border border-line bg-void px-4 py-3 pr-16 text-sm outline-none focus:border-pulse"
          />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fog hover:text-white">
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="confirm-password" className="text-xs text-fog">Confirm new password</label>
        <input id="confirm-password" required minLength={8} type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={input} />
      </div>
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black disabled:opacity-60">
        {busy ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
