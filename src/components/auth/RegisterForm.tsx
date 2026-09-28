'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logAuthError } from '@/lib/auth-errors';

const CONFIG_ERROR = 'Authentication is misconfigured. Please try again later.';

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
  const [showPassword, setShowPassword] = useState(false);
  const [referral, setReferral] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="mt-6 space-y-4"
      autoComplete="on"
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
            const kind = logAuthError('signup', error);
            setError(kind === 'CONFIG' ? CONFIG_ERROR : friendlyError(error.message));
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
        } catch (err) {
          const kind = logAuthError('signup:exception', err);
          setError(kind === 'CONFIG' ? CONFIG_ERROR : 'Network error reaching authentication. Check your connection.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <div><label htmlFor="email" className="text-xs text-fog">Email</label><input id="email" name="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="password" className="text-xs text-fog">Password</label>
          <div className="relative mt-1">
            <input id="password" name="password" required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Create a password" className="w-full rounded-xl border border-line bg-void px-4 py-3 pr-16 text-sm outline-none focus:border-pulse" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fog hover:text-white">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="password-confirm" className="text-xs text-fog">Confirm</label>
          <div className="relative mt-1">
            <input id="password-confirm" name="password-confirm" required minLength={8} type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-line bg-void px-4 py-3 pr-16 text-sm outline-none focus:border-pulse" />
          </div>
        </div>
      </div>
      <div><label htmlFor="referral" className="text-xs text-fog">Referral code (optional)</label><input id="referral" name="referral" value={referral} onChange={(e) => setReferral(e.target.value)} placeholder="AB12CD" autoComplete="off" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black disabled:opacity-60">{busy ? 'Creating…' : 'Create Account'}</button>
    </form>
  );
}
