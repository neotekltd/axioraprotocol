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
import { useT } from '@/components/LanguageProvider';
import type { Dictionary } from '@/lib/i18n-dict';

const USERNAME_RE = /^[a-z0-9_]{6,}$/;

function friendlyError(t: Dictionary, message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists') || m.includes('duplicate'))
    return t.auth.alreadyExists;
  if (m.includes('already') && m.includes('confirm'))
    return t.auth.alreadyVerified;
  if (m.includes('password')) return t.auth.weakPassword;
  if (m.includes('email')) return t.validation.invalidEmail;
  if (m.includes('rate limit') || m.includes('too many')) return t.auth.rateLimit;
  if (m.includes('network') || m.includes('fetch')) return t.auth.networkError;
  return t.auth.registerFailed;
}

async function recoverExistingAccount(
  t: Dictionary,
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
    result.code === 'RATE_LIMIT' ? t.auth.rateLimitResend : t.auth.alreadyExists
  );
}

export function RegisterForm({ referredCode = null }: { referredCode?: string | null }) {
  const t = useT();
  const CONFIG_ERROR = t.auth.configError;
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
      setError(t.auth.usernameError);
      return;
    }
    setUsername(clean);
    setError(null);
    setStep(2);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t.auth.passwordsNoMatch);
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
          await recoverExistingAccount(t, supabase, cleanEmail, router, setError);
          return;
        }
        setError(friendlyError(t, error.message));
        return;
      }
      if (data.session) {
        router.replace('/app/dashboard');
        router.refresh();
        return;
      }
      const identities = (data.user as { identities?: unknown[] } | null)?.identities;
      if (data.user && Array.isArray(identities) && identities.length === 0) {
        await recoverExistingAccount(t, supabase, cleanEmail, router, setError);
        return;
      }
      router.replace(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err) {
      const kind = logAuthError('signup:exception', err);
      setError(kind === 'CONFIG' ? CONFIG_ERROR : t.auth.networkError);
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
          {t.auth.registerTitle}
        </h1>
        <p className="mt-2 text-[14px] text-[#78859A]">{t.auth.registerSub}</p>

        {step === 1 ? (
          <form onSubmit={continueToPassword} className="mt-4" autoComplete="on">
            <p className="text-[17px] leading-relaxed text-[#AAB5C7]">{t.auth.freeMinute}</p>
            <div className="mt-6 flex items-baseline justify-between gap-3">
              <label htmlFor="username" className="text-[15px] font-bold text-white">{t.profile.username}</label>
              <span className="text-right text-[13px] text-[#78859A]">{t.auth.usernameRule}</span>
            </div>
            <AxInput
              id="username" name="username" required value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder={t.auth.usernamePh} autoComplete="username" autoCapitalize="none"
              spellCheck={false} maxLength={30} pattern="[a-z0-9_]{6,}"
              className="mt-2 min-h-[58px] text-[16px]" dir="ltr"
            />
            <div className="mb-2 mt-6 block text-[15px] font-bold text-white">
              <label htmlFor="email">{t.auth.emailLabel}</label>
            </div>
            <AxInput
              id="email" name="email" required type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder} autoComplete="email" inputMode="email"
              autoCapitalize="none" spellCheck={false} className="mt-2 min-h-[58px] text-[16px]" dir="ltr"
            />
            <div className="mb-2 mt-6 flex items-baseline justify-between gap-3">
              <label htmlFor="referral" className="text-[15px] font-bold text-white">{t.auth.invitedBy}</label>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#596579]">{t.common.optional}</span>
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
              placeholder={t.auth.referralPh} autoComplete="off" className="mt-2 min-h-[58px] text-[16px]" dir="ltr"
            />
            {referredCode ? <FieldSuccess message={t.auth.referralApplied} /> : null}
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#78859A]">{t.auth.creditNote}</p>
            <FieldError message={error} />
            <div className="mt-6">
              <AxButton>
                {t.common.continue} <ArrowRight size={17} aria-hidden="true" />
              </AxButton>
            </div>
            <div className="mt-[26px] border-t border-[#202A3A]/80 pt-[22px] text-center text-[14px] text-[#78859A]">
              {t.auth.haveAccount} <Link href="/login" className="font-semibold text-[#2FD6FF] hover:brightness-110">{t.auth.signIn}</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={submit} className="mt-4" autoComplete="on">
            <p className="text-[17px] leading-relaxed text-[#AAB5C7]">
              {t.auth.securing.replace('{id}', username || email.trim())}
            </p>
            <div className="mt-6">
              <AxPasswordInput label={t.auth.passwordLabel} id="password" name="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder={t.auth.createPasswordPh} showLabel={t.auth.showPassword} hideLabel={t.auth.hidePassword} />
              <PasswordStrength password={password} />
            </div>
            <div className="mt-5">
              <AxPasswordInput label={t.auth.confirmPassword} id="password-confirm" name="password-confirm" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder={t.auth.repeatPasswordPh} showLabel={t.auth.showPassword} hideLabel={t.auth.hidePassword} />
              {confirm.length > 0 && (
                match
                  ? <FieldSuccess message={t.auth.matches} />
                  : <FieldError message={t.auth.noMatchYet} />
              )}
            </div>
            <FieldError message={error} />
            <div className="mt-6">
              <AxButton disabled={busy}>
                {busy ? t.auth.creating : <>{t.auth.create} <ArrowRight size={17} aria-hidden="true" /></>}
              </AxButton>
            </div>
            <div className="mt-[26px] border-t border-[#202A3A]/80 pt-[22px] text-center text-[14px]">
              <button type="button" onClick={() => { setStep(1); setError(null); }} className="text-[#78859A] hover:text-white">
                ← {t.auth.backToDetails}
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
