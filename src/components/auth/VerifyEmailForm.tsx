'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logAuthError } from '@/lib/auth-errors';
import { OtpInput } from '@/components/auth/OtpInput';

const COOLDOWN = 60;

function friendlyError(message: string): 'invalid' | 'expired' {
  const m = message.toLowerCase();
  if (m.includes('expired')) return 'expired';
  return 'invalid';
}

// Privacy-safe display: j***@example.com (never the full address in UI text).
function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return 'your email';
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const shown = local.length <= 1 ? '*' : `${local[0]}***`;
  return `${shown}@${domain}`;
}

export function VerifyEmailForm() {
  const params = useSearchParams();
  const router = useRouter();
  // Email is bound to the signup attempt — never editable here.
  const email = params.get('email')?.trim() ?? '';
  // Set when the user arrives via the existing-unverified recovery path.
  const resentNotice = params.get('resent') === '1';
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<'idle' | 'invalid' | 'expired'>('idle');
  const [cooldown, setCooldown] = useState(0);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  if (!email) {
    return (
      <p className="mt-6 text-sm text-fog">
        No signup email found. <Link href="/register" className="text-pulse">Create an account</Link> first, or{' '}
        <Link href="/login" className="text-pulse">sign in</Link>.
      </p>
    );
  }

  const verify = async (token: string) => {
    setBusy(true);
    setState('idle');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (error) {
        setState(friendlyError(error.message));
        return;
      }
      // Session established. Ensure the Axiora profile row exists (trigger
      // normally creates it; this is a safe idempotent backstop under RLS).
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
        if (!profile) {
          await supabase.from('profiles').insert({ id: user.id, email: user.email ?? email });
        }
      }
      router.replace('/app/dashboard');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setState('idle');
    setResendError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        logAuthError('verify:resend', error);
        const m = error.message.toLowerCase();
        const status = (error as { status?: number }).status;
        setResendError(
          status === 429 || m.includes('rate limit') || m.includes('too many')
            ? 'Too many resend attempts. Wait a minute and try again.'
            : 'Could not resend the code right now. Wait a moment and try again.'
        );
        return;
      }
      setCooldown(COOLDOWN);
    } catch (err) {
      logAuthError('verify:resend:exception', err);
      setResendError('Could not resend the code. Check your connection and try again.');
    }
  };

  return (
    <div className="mt-6">
      {resentNotice && (
        <p role="status" className="mb-4 rounded-xl border border-pulse/40 bg-pulse/10 px-4 py-3 text-center text-xs text-pulse">
          We sent a new verification code to your email.
        </p>
      )}
      <p className="text-center text-sm text-fog">
        We sent a 6-digit verification code to
        <br />
        <span className="font-mono text-white">{maskEmail(email)}</span>
      </p>
      <div className="mt-6">
        <OtpInput
          value={code}
          onChange={(c) => {
            setCode(c);
            setState('idle');
            if (c.length === 6 && !busy) void verify(c);
          }}
          disabled={busy}
          invalid={state !== 'idle'}
        />
      </div>
      {state === 'invalid' && (
        <p role="alert" className="mt-4 text-center text-xs text-danger">That verification code is invalid.</p>
      )}
      {state === 'expired' && (
        <p role="alert" className="mt-4 text-center text-xs text-danger">That code has expired. Request a new one below.</p>
      )}
      <button
        disabled={busy || code.length !== 6}
        onClick={() => void verify(code)}
        className="mt-6 w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black disabled:opacity-60"
      >
        {busy ? 'Verifying…' : 'Verify Email'}
      </button>
      <div className="mt-5 text-center text-xs text-fog">
        Didn&apos;t receive the code?{' '}
        <button disabled={cooldown > 0} onClick={() => void resend()} className="text-pulse disabled:text-fog">
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
      {resendError && (
        <p role="alert" className="mt-3 text-center text-xs text-danger">{resendError}</p>
      )}
      <div className="mt-2 text-center text-xs">
        <Link href="/register" className="text-fog hover:text-white">Change email</Link>
      </div>
    </div>
  );
}
