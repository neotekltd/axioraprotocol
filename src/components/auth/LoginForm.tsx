'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logAuthError } from '@/lib/auth-errors';
import { isEmailLike, normalizeAuthEmail, normalizeUsername } from '@/lib/auth-identifiers';
import { AxButton, AxInput, AxPasswordInput, FieldError } from '@/components/ax/controls';
import { AxCard } from '@/components/ax/primitives';
import { useT } from '@/components/LanguageProvider';

export function LoginForm() {
  const t = useT();
  // Generic on purpose: never reveal whether the identifier or the password
  // was wrong, or whether the account exists (anti-enumeration).
  const INVALID_ERROR = t.auth.invalidCredentials;
  const CONFIG_ERROR = t.auth.configError;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');

  const resolveEmail = async (raw: string): Promise<string | null> => {
    if (isEmailLike(raw)) return normalizeAuthEmail(raw);
    const username = normalizeUsername(raw);
    if (!username) return null;
    try {
      const res = await fetch('/api/auth/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username }),
      });
      const body = (await res.json()) as { email?: unknown };
      return typeof body.email === 'string' && body.email.includes('@') ? body.email : null;
    } catch {
      return null;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      // Supabase password sign-in uses the real account email; a username is
      // resolved to its email server-side first. The password is only ever
      // sent to Supabase Auth — never to the resolver.
      const email = await resolveEmail(identifier);
      if (!email) {
        setError(INVALID_ERROR);
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const kind = logAuthError('login', error);
        if (kind === 'CONFIG') {
          setError(CONFIG_ERROR);
          return;
        }
        if (error.message.toLowerCase().includes('email not confirmed')) {
          router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(INVALID_ERROR);
        return;
      }
      // Destination is decided server-side from the verified session via
      // /auth/landing: sole admin -> /admin with no dashboard flash,
      // everyone else -> requested in-app path or dashboard.
      router.replace(next ? `/auth/landing?next=${encodeURIComponent(next)}` : '/auth/landing');
      router.refresh();
    } catch (err) {
      const kind = logAuthError('login:exception', err);
      setError(kind === 'CONFIG' ? CONFIG_ERROR : t.auth.networkError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[480px] px-7 pb-16 pt-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[14px] text-[#AAB5C7] hover:text-white" aria-label={t.authShell.backToSite}>
        <ArrowLeft size={16} /> {t.common.back}
      </Link>
      <AxCard className="mt-6 p-7 sm:p-8">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2FD6FF]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#2FD6FF]" />
        </div>
        <h1 className="mt-5 text-[32px] font-bold leading-tight tracking-tight text-white">
          {t.auth.loginTitle}
        </h1>
        <p className="mt-2 text-[14px] text-[#78859A]">{t.auth.loginSub}</p>
        <form onSubmit={submit} className="mt-7 space-y-5" autoComplete="on">
          <div>
            <label htmlFor="login-identifier" className="mb-2 block text-[15px] text-[#AAB5C7]">{t.auth.usernameLabel}</label>
            <AxInput
              id="login-identifier" name="identifier" required type="text" value={identifier}
              onChange={(e) => setIdentifier(e.target.value)} placeholder={t.auth.usernamePlaceholder}
              autoComplete="username" autoCapitalize="none" spellCheck={false} dir="ltr"
            />
          </div>
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label htmlFor="login-password" className="text-[15px] text-[#AAB5C7]">{t.auth.passwordLabel}</label>
              <Link href="/forgot-password" className="text-[13px] font-semibold text-[#2FD6FF] hover:brightness-110">
                {t.auth.forgot}
              </Link>
            </div>
            <AxPasswordInput id="login-password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder={t.auth.passwordPlaceholder} showLabel={t.auth.showPassword} hideLabel={t.auth.hidePassword} />
          </div>
          {params.get('error') === 'callback' && (
            <p className="text-[13px] text-[#F2BF4A]">{t.auth.badLink}</p>
          )}
          <FieldError message={error} />
          <AxButton disabled={busy}>
            {busy ? t.auth.signingIn : <>{t.auth.signIn} <ArrowRight size={17} aria-hidden="true" /></>}
          </AxButton>
        </form>
        <div className="mt-5 border-t border-[#202A3A]/80 pt-5 text-center text-[14px] text-[#AAB5C7]">
          {t.auth.noAccount} <Link href="/register" className="font-semibold text-[#2FD6FF] hover:brightness-110">{t.auth.createAccount}</Link>
        </div>
      </AxCard>
    </div>
  );
}
