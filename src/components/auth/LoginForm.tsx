'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logAuthError } from '@/lib/auth-errors';
import { AxButton, AxInput, AxPasswordInput, FieldError } from '@/components/ax/controls';
import { AxCard } from '@/components/ax/primitives';

const CONFIG_ERROR = 'Authentication is misconfigured. Please try again later.';

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Incorrect email or password. Try again or reset your password.';
  if (m.includes('email not confirmed')) return 'Please verify your email first — check your inbox for the code.';
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        const kind = logAuthError('login', error);
        if (kind === 'CONFIG') {
          setError(CONFIG_ERROR);
          return;
        }
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
          Welcome <span className="text-[#2FD6FF]">back.</span>
        </h1>
        <p className="mt-2 text-[14px] text-[#78859A]">Sign in with your email and password.</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-[15px] text-[#AAB5C7]">Email</label>
            <AxInput id="login-email" name="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} />
          </div>
          <div>
            <AxPasswordInput label="Password" id="login-password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Your password" />
          </div>
          {params.get('error') === 'callback' && (
            <p className="text-[13px] text-[#F2BF4A]">That sign-in link was invalid or expired. Please sign in again.</p>
          )}
          <FieldError message={error} />
          <AxButton disabled={busy}>
            {busy ? 'Signing in…' : <>Sign in <ArrowRight size={17} aria-hidden="true" /></>}
          </AxButton>
        </form>
        <div className="mt-5 flex items-center justify-between text-[14px]">
          <Link href="/forgot-password" className="text-[#AAB5C7] hover:text-white">Forgot password?</Link>
          <Link href="/register" className="font-semibold text-white hover:text-[#2FD6FF]">Create account</Link>
        </div>
      </AxCard>
    </div>
  );
}
