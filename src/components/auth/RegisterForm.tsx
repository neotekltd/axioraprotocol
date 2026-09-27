'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists') || m.includes('duplicate'))
    return 'An account with this email already exists. Try signing in instead.';
  if (m.includes('password')) return 'Password does not meet requirements (minimum 8 characters).';
  if (m.includes('email')) return 'Please enter a valid email address.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a moment and try again.';
  if (m.includes('network') || m.includes('fetch')) return 'Network error reaching authentication. Check your connection.';
  return 'Registration failed. Please try again.';
}

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [referral, setReferral] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (password !== confirm) {
          setError('Passwords do not match.');
          return;
        }
        setBusy(true);
        setError(null);
        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: referral.trim() ? { referral_code: referral.trim() } : {},
            },
          });
          if (error) {
            setError(friendlyError(error.message));
            return;
          }
          // Confirm-email ON (expected): no session yet → enter the 6-digit code.
          // Confirm-email OFF: session exists → straight to the app.
          if (data.session) {
            router.replace('/app/dashboard');
            router.refresh();
            return;
          }
          router.replace(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        } catch {
          setError('Network error reaching authentication. Check your connection.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <div><label className="text-xs text-fog">Email</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-fog">Password</label><input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
        <div><label className="text-xs text-fog">Confirm</label><input required minLength={8} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
      </div>
      <div><label className="text-xs text-fog">Referral code (optional)</label><input value={referral} onChange={(e) => setReferral(e.target.value)} placeholder="AB12CD" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black disabled:opacity-60">{busy ? 'Creating…' : 'Create Account'}</button>
    </form>
  );
}
