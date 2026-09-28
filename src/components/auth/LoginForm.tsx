'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logAuthError } from '@/lib/auth-errors';

const CONFIG_ERROR = 'Authentication is misconfigured. Please try again later.';

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Incorrect email or password. Try again or reset your password.';
  if (m.includes('email not confirmed')) return 'Please verify your email first — check your inbox for the confirmation link.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a moment and try again.';
  if (m.includes('network') || m.includes('fetch')) return 'Network error reaching authentication. Check your connection.';
  return 'Sign-in failed. Please try again.';
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/app/dashboard';

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
          if (error) {
            logAuthError('login', error);
            // Unverified account: send them to code verification, not a dead end.
            if (error.message.toLowerCase().includes('email not confirmed')) {
              router.replace(`/verify-email?email=${encodeURIComponent(email.trim())}`);
              return;
            }
            setError(friendlyError(error.message));
            return;
          }
          router.replace(next);
          router.refresh();
        } catch (err) {
          const kind = logAuthError('login:exception', err);
          setError(kind === 'CONFIG' ? CONFIG_ERROR : 'Network error reaching authentication. Check your connection.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <div><label htmlFor="login-email" className="text-xs text-fog">Email</label><input id="login-email" name="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
      <div><label htmlFor="login-password" className="text-xs text-fog">Password</label><input id="login-password" name="password" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
      <div className="flex items-center justify-between text-xs"><span className="text-fog">Session persists securely via HTTP-only cookies</span><Link href="/forgot-password" className="text-pulse">Forgot password?</Link></div>
      {params.get('error') === 'callback' && <p className="text-xs text-danger">That sign-in link was invalid or expired. Please sign in again.</p>}
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
