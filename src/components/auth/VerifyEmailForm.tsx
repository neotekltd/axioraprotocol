'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logAuthError } from '@/lib/auth-errors';
import { resendSignupVerification, resendUserMessage } from '@/lib/auth-email';
import { OtpInput } from '@/components/auth/OtpInput';
import { AxButton, FieldError } from '@/components/ax/controls';
import { AxCard } from '@/components/ax/primitives';
import { useT } from '@/components/LanguageProvider';
import type { Dictionary } from '@/lib/i18n-dict';

const COOLDOWN = 60;

function maskEmail(t: Dictionary['auth'], email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return t.maskedFallback;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const shown = local.length <= 1 ? '*' : `${local[0]}***`;
  return `${shown}@${domain}`;
}

export function VerifyEmailForm() {
  const t = useT();
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get('email')?.trim() ?? '';
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
      <div className="mx-auto w-full max-w-[480px] px-7 pb-16 pt-10">
        <AxCard className="p-7 text-center">
          <p className="text-[15px] text-[#AAB5C7]">
            {t.auth.noEmail} <Link href="/register" className="font-semibold text-white hover:text-[#2FD6FF]">{t.auth.createAccount}</Link> {t.auth.firstOr}{' '}
            <Link href="/login" className="font-semibold text-white hover:text-[#2FD6FF]">{t.auth.signIn}</Link>.
          </p>
        </AxCard>
      </div>
    );
  }

  const verify = async (token: string) => {
    setBusy(true);
    setState('idle');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (error) {
        const m = error.message.toLowerCase();
        setState(m.includes('expired') ? 'expired' : 'invalid');
        return;
      }
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user) {
        const metaUsername =
          (user.user_metadata as { username?: unknown } | null)?.username;
        const username =
          typeof metaUsername === 'string' && /^[a-z0-9_]{6,}$/.test(metaUsername) ? metaUsername : null;
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
        if (!profile) {
          await supabase.from('profiles').insert({ id: user.id, email: user.email ?? email, username });
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
      const result = await resendSignupVerification(
        supabase,
        email,
        `${window.location.origin}/auth/callback`
      );
      if (!result.ok) {
        setResendError(resendUserMessage(result.code, t.auth));
        return;
      }
      setCooldown(COOLDOWN);
    } catch (err) {
      logAuthError('verify:resend:exception', err);
      setResendError(t.auth.resendFailed);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[480px] px-7 pb-16 pt-10">
      <Link href="/register" className="inline-flex items-center gap-1.5 text-[14px] text-[#AAB5C7] hover:text-white" aria-label={t.common.back}>
        <ArrowLeft size={16} /> {t.common.back}
      </Link>
      <AxCard className="mt-6 p-7 sm:p-8">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-10 rounded-full bg-[#2FD6FF]" />
          <span className="h-1.5 w-10 rounded-full bg-[#2FD6FF]" />
        </div>
        <h1 className="mt-5 text-[32px] font-bold leading-tight tracking-tight text-white">
          {t.auth.verifyTitle}
        </h1>
        {resentNotice && (
          <p role="status" className="mt-4 rounded-[14px] border border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.08)] px-4 py-3 text-center text-[13px] text-[#2FD6FF]">
            {t.auth.codeSent}
          </p>
        )}
        <p className="mt-4 text-center text-[14px] text-[#AAB5C7]">
          {t.auth.verifySub}
          <br />
          <span className="font-mono text-white">{maskEmail(t.auth, email)}</span>
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
          <p role="alert" className="mt-4 text-center text-[13px] text-[#F06B78]">{t.auth.codeInvalid}</p>
        )}
        {state === 'expired' && (
          <p role="alert" className="mt-4 text-center text-[13px] text-[#F06B78]">{t.auth.codeExpired}</p>
        )}
        <div className="mt-6">
          <AxButton disabled={busy || code.length !== 6} onClick={() => void verify(code)}>
            {busy ? t.auth.verifying : t.auth.verifyEmailBtn}
          </AxButton>
        </div>
        <div className="mt-5 text-center text-[13px] text-[#78859A]">
          {t.auth.didntReceive}{' '}
          <button disabled={cooldown > 0} onClick={() => void resend()} className="font-semibold text-[#2FD6FF] disabled:text-[#596579]">
            {cooldown > 0 ? `${t.auth.resendIn} ${cooldown}${t.auth.seconds}` : t.auth.resend}
          </button>
        </div>
        <FieldError message={resendError} />
        <div className="mt-2 text-center text-[13px]">
          <Link href="/register" className="text-[#78859A] hover:text-white">{t.auth.changeEmail}</Link>
        </div>
      </AxCard>
    </div>
  );
}
