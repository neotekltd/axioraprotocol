'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/data';
import { createClient } from '@/lib/supabase/client';

const input = 'mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse sm:max-w-xs';

export function SecurityView({ email, verified }: { email: string; verified: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const changePassword = async () => {
    setMessage(null);
    if (password.length < 8) {
      setMessage({ ok: false, text: 'New password must be at least 8 characters.' });
      return;
    }
    if (password !== confirm) {
      setMessage({ ok: false, text: 'Passwords do not match.' });
      return;
    }
    setBusy(true);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      setMessage(error ? { ok: false, text: error.message } : { ok: true, text: 'Password updated.' });
      if (!error) {
        setPassword('');
        setConfirm('');
      }
    } catch {
      setMessage({ ok: false, text: 'Could not update the password. Check your connection.' });
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <div>
      <PageHeader title="Security" sub={`Signed in as ${email}`} />
      <div className="glass mt-6 max-w-2xl space-y-5 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <div className="font-semibold">Email verification</div>
            <div className={`mt-0.5 text-xs ${verified ? 'text-pulse' : 'text-amberx'}`}>
              {verified ? 'Verified' : 'Not verified — check your inbox for the confirmation email'}
            </div>
          </div>
          {!verified && <Link href="/verify-email" className="rounded-lg border border-line px-4 py-1.5 text-xs hover:border-pulse/50">Verify now</Link>}
        </div>
        <div className="border-t border-line pt-5">
          <div className="text-sm font-semibold">Change password</div>
          <label htmlFor="new-password" className="mt-3 block text-xs text-fog">New password (min. 8 characters)</label>
          <input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
          <label htmlFor="confirm-password" className="mt-3 block text-xs text-fog">Confirm new password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
          {message && <p role={message.ok ? 'status' : 'alert'} className={`mt-3 text-xs ${message.ok ? 'text-pulse' : 'text-danger'}`}>{message.text}</p>}
          <button onClick={changePassword} disabled={busy} className="mt-4 rounded-xl border border-line px-6 py-2.5 text-sm hover:border-pulse/50 disabled:opacity-60">
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </div>
        <div className="border-t border-line pt-5 text-sm">
          <div className="font-semibold">Two-factor authentication</div>
          <p className="mt-1 text-xs text-fog">TOTP two-factor is not available in this release. Withdrawals are gated by email-verified sessions and saved-address verification instead. No authenticator is configured — nothing here claims otherwise.</p>
        </div>
        <div className="border-t border-line pt-5">
          <div className="text-sm font-semibold">Session</div>
          <p className="mt-1 text-xs text-fog">This device holds the current session via secure HTTP-only cookies.</p>
          <button onClick={signOut} disabled={signingOut} className="mt-3 rounded-xl border border-danger/40 px-6 py-2.5 text-sm text-danger hover:bg-danger/10 disabled:opacity-60">
            {signingOut ? 'Signing out…' : 'Sign out everywhere on this device'}
          </button>
        </div>
      </div>
    </div>
  );
}
