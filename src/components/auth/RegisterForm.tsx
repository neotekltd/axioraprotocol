'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logAuthError } from '@/lib/auth-errors';
import { writeReferralCookieIfAbsent } from '@/lib/referral-cookie';
import { normalizeAuthEmail } from '@/lib/auth-identifiers';
import { resendSignupVerification, resendUserMessage } from '@/lib/auth-email';
import { AuthShell } from '@/components/auth/AuthShell';
import { AxButton, AxInput, AxPasswordInput, FieldError, FieldSuccess, PasswordStrength } from '@/components/ax/controls';

const CONFIG_ERROR = 'Authentication is misconfigured. Please try again later.';
const USERNAME_RE = /^[a-z0-9_]{6,}$/;

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
  const result = await resendSignupVerification(
    supabase,
    cleanEmail,
    `${window.location.origin}/auth/callback`
  );
  if (result.ok) {
    router.replace(`/verify-email?email=${encodeURIComponent(cleanEmail)}&resent=1`);
    return;
  }
  if (result.code !== 'RATE_LIMIT') {
    logAuthError('signup:resend:unconfirmed', { message: result.code });
  }
  setError(
    result.code === 'RATE_LIMIT'
      ? 'Too many attempts. Wait a moment and try again — or use Resend on the verification page.'
      : 'An account with this email already exists. Try signing in instead.'
  );
}

export function RegisterForm({ referredCode = null }: { referredCode?: string | null }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [referral, setReferral] = useState(referredCode ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const match = confirm.length > 0 && password === confirm;

  const continueToPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().toLowerCase();
    if (!USERNAME_RE.test(clean)) {
      setError('Username must be at least 6 characters: a–z, 0–9, _');
      return;
    }
    setUsername(clean);
    setError(null);
    setStep(2);
  };

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
      const cleanEmail = normalizeAuthEmail(email);
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username,
            ...(referral.trim() ? { referral_code: referral.trim() } : {}),
          },
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
    <AuthShell>
      <div className="rounded-[22px] border border-[rgba(100,150,190,0.25)] bg-[#0B0F17]/95 p-7 shadow-[0_0_60px_rgba(47,214,255,0.07)] sm:p-9">
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-[5px] w-11 rounded-full bg-[#2FD6FF] shadow-[0_0_12px_rgba(47,214,255,0.7)]" />
          <span className={`h-[5px] w-11 rounded-full transition ${step === 2 ? 'bg-[#2FD6FF] shadow-[0_0_12px_rgba(47,214,255,0.7)]' : 'bg-[#2A394D]'}`} />
        </div>
        <h1 className="mt-6 text-[36px] font-bold leading-[1.05] tracking-tight text-white sm:text-[40px]">
          Create your <span className="text-[#2FD6FF]">account.</span>
        </h1>

        {step === 1 ? (
          <form onSubmit={continueToPassword} className="mt-4" autoComplete="on">
            <p className="text-[17px] leading-relaxed text-[#AAB5C7]">It&apos;s free and takes about a minute.</p>
            <div className="mt-6 flex items-baseline justify-between gap-3">
              <label htmlFor="username" className="text-[15px] font-bold text-white">Username</label>
              <span className="text-right text-[13px] text-[#78859A]">6+ characters: a–z, 0–9, _</span>
            </div>
            <AxInput
              id="username" name="username" required value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Choose a username" autoComplete="username" autoCapitalize="none"
              spellCheck={false} maxLength={30} pattern="[a-z0-9_]{6,}"
              className="mt-2 min-h-[58px] text-[16px]"
            />
            <div className="mb-2 mt-6 block text-[15px] font-bold text-white">
              <label htmlFor="email">Email</label>
            </div>
            <AxInput
              id="email" name="email" required type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" inputMode="email"
              autoCapitalize="none" spellCheck={false} className="mt-2 min-h-[58px] text-[16px]"
            />
            <div className="mb-2 mt-6 flex items-baseline justify-between gap-3">
              <label htmlFor="referral" className="text-[15px] font-bold text-white">Invited by</label>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#596579]">optional</span>
            </div>
            <AxInput
              id="referral" name="referral" value={referral}
              onChange={(e) => {
                const next = e.target.value;
                setReferral(next);
                // Manual entry also persists first-touch (only when no
                // /r/ code was captured earlier — never overwrites it).
                writeReferralCookieIfAbsent(next);
              }}
              placeholder="Referral code" autoComplete="off" className="mt-2 min-h-[58px] text-[16px]"
            />
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#78859A]">They get the credit, paid from protocol rewards — not out of your deposit.</p>
            <FieldError message={error} />
            <div className="mt-6">
              <AxButton>
                Continue <ArrowRight size={17} aria-hidden="true" />
              </AxButton>
            </div>
            <div className="mt-[26px] border-t border-[#202A3A]/80 pt-[22px] text-center text-[14px] text-[#78859A]">
              Already have an account? <Link href="/login" className="font-semibold text-[#2FD6FF] hover:brightness-110">Sign in</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={submit} className="mt-4" autoComplete="on">
            <p className="text-[17px] leading-relaxed text-[#AAB5C7]">
              Securing <span className="font-mono text-white">{username || email.trim()}</span> — set a password to finish.
            </p>
            <div className="mt-6">
              <AxPasswordInput label="Password" id="password" name="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Create a password" />
              <PasswordStrength password={password} />
            </div>
            <div className="mt-5">
              <AxPasswordInput label="Repeat password" id="password-confirm" name="password-confirm" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Repeat your password" />
              {confirm.length > 0 && (
                match
                  ? <FieldSuccess message="Matches" />
                  : <FieldError message="Passwords do not match yet." />
              )}
            </div>
            <FieldError message={error} />
            <div className="mt-6">
              <AxButton disabled={busy}>
                {busy ? 'Creating…' : <>Create account <ArrowRight size={17} aria-hidden="true" /></>}
              </AxButton>
            </div>
            <div className="mt-[26px] border-t border-[#202A3A]/80 pt-[22px] text-center text-[14px]">
              <button type="button" onClick={() => { setStep(1); setError(null); }} className="text-[#78859A] hover:text-white">
                ← Back to account details
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
