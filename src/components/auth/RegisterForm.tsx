'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logAuthError } from '@/lib/auth-errors';
import { AxButton, AxInput, AxPasswordInput, FieldError, FieldSuccess, PasswordStrength } from '@/components/ax/controls';
import { AxCard } from '@/components/ax/primitives';

const CONFIG_ERROR = 'Authentication is misconfigured. Please try again later.';

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists') || m.includes('duplicate'))
    return 'An account with this email already exists. Try signing in instead.';
  if (m.includes('already') && m.includes('confirm'))
    return 'This email is already verified. Try signing in instead.';
  if (m.includes('password')) return 'Password does not meet requirements (minimum 8 characters).';
  if (m.includes('email')) return 'Please enter a valid email address.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a moment and try again.';
  if (m.includes('network') || m.includes('fetch')) return 'Network error reaching authentication. Check your connection.';
  return 'Registration failed. Please try again.';
}

async function recoverExistingAccount(
  supabase: ReturnType<typeof createClient>,
  cleanEmail: string,
  router: ReturnType<typeof useRouter>,
  setError: (m: string | null) => void
) {
  const { error: resendError } = await supabase.auth.resend({
    type: 'signup',
    email: cleanEmail,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (!resendError) {
    router.replace(`/verify-email?email=${encodeURIComponent(cleanEmail)}&resent=1`);
    return;
  }
  logAuthError('signup:resend', resendError);
  const m = resendError.message.toLowerCase();
  const status = (resendError as { status?: number }).status;
  if (status === 429 || m.includes('rate limit') || m.includes('too many')) {
    setError('Too many attempts. Wait a moment and try again — or use Resend on the verification page.');
  } else {
    setError('An account with this email already exists. Try signing in instead.');
  }
}

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [referral, setReferral] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const match = confirm.length > 0 && password === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: referral.trim() ? { referral_code: referral.trim() } : {},
        },
      });
      if (error) {
        const kind = logAuthError('signup', error);
        if (kind === 'CONFIG') {
          setError(CONFIG_ERROR);
          return;
        }
        const m = error.message.toLowerCase();
        if (m.includes('already registered') || m.includes('already exists') || m.includes('duplicate')) {
          await recoverExistingAccount(supabase, cleanEmail, router, setError);
          return;
        }
        setError(friendlyError(error.message));
        return;
      }
      if (data.session) {
        router.replace('/app/dashboard');
        router.refresh();
        return;
      }
      const identities = (data.user as { identities?: unknown[] } | null)?.identities;
      if (data.user && Array.isArray(identities) && identities.length === 0) {
        await recoverExistingAccount(supabase, cleanEmail, router, setError);
        return;
      }
      router.replace(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err) {
      const kind = logAuthError('signup:exception', err);
      setError(kind === 'CONFIG' ? CONFIG_ERROR : 'Network error reaching authentication. Check your connection.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[480px] px-7 pb-16 pt-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[14px] text-[#AAB5C7] hover:text-white" aria-label="Back to home">
        <ArrowLeft size={16} /> Back
      </Link>
      <AxCard className="mt-6 p-7 sm:p-8">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-10 rounded-full bg-[#2FD6FF]" />
          <span className="h-1.5 w-10 rounded-full bg-[#2FD6FF]" />
        </div>
        <h1 className="mt-5 text-[32px] font-bold leading-tight tracking-tight text-white">
          Create your <span className="text-[#2FD6FF]">account.</span>
        </h1>
        <form onSubmit={submit} className="mt-7 space-y-5" autoComplete="on">
          <div>
            <label htmlFor="email" className="mb-2 block text-[15px] text-[#AAB5C7]">Email</label>
            <AxInput id="email" name="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} />
          </div>
          <div>
            <AxPasswordInput label="Password" id="password" name="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Create a password" />
            <PasswordStrength password={password} />
          </div>
          <div>
            <AxPasswordInput label="Repeat password" id="password-confirm" name="password-confirm" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Repeat your password" />
            {confirm.length > 0 && (
              match
                ? <FieldSuccess message="Matches" />
                : <FieldError message="Passwords do not match yet." />
            )}
          </div>
          <div>
            <label htmlFor="referral" className="mb-2 flex items-baseline justify-between text-[15px] text-[#AAB5C7]">
              Invited by <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#596579]">optional</span>
            </label>
            <AxInput id="referral" name="referral" value={referral} onChange={(e) => setReferral(e.target.value)} placeholder="Referral code" autoComplete="off" />
            <p className="mt-2 text-[13px] leading-relaxed text-[#78859A]">They get the credit, paid from protocol rewards — not out of your deposit.</p>
          </div>
          <FieldError message={error} />
          <AxButton disabled={busy}>
            {busy ? 'Creating…' : <>Create account <ArrowRight size={17} aria-hidden="true" /></>}
          </AxButton>
        </form>
        <p className="mt-5 text-center text-[14px] text-[#78859A]">
          Have an account? <Link href="/login" className="font-semibold text-white hover:text-[#2FD6FF]">Sign in</Link>
        </p>
      </AxCard>
    </div>
  );
}
